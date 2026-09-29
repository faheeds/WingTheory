import { createHmac, timingSafeEqual } from "node:crypto";

export type UberDirectConfig = {
  clientId: string;
  clientSecret: string;
  customerId: string;
};

export type UberDirectQuote = {
  id: string;
  expires: string;
  feeCents: number;
  currency: string;
  durationMinutes: number;
};

export type UberDirectDelivery = {
  id: string;
  status: string;
  trackingUrl: string | null;
  liveMode: boolean;
};

type UberAddress = string;

export type UberDirectDeliveryRequest = {
  quoteId: string;
  pickupAddress: UberAddress;
  pickupName: string;
  pickupPhoneNumber: string;
  dropoffAddress: UberAddress;
  dropoffName: string;
  dropoffPhoneNumber: string;
  manifestItems: Array<{ name: string; quantity: number }>;
  externalId: string;
};

export class UberDirectError extends Error {
  readonly status: number;
  readonly operation: string;

  constructor(status: number, operation: string) {
    super(`Uber Direct ${operation} failed (${status}).`);
    this.name = "UberDirectError";
    this.status = status;
    this.operation = operation;
  }
}

/** Verify the exact raw request body before parsing a webhook. */
export function verifyUberDirectWebhook(
  rawBody: string | Buffer,
  signature: string | null,
  signingKey: string,
): boolean {
  if (!signingKey || !signature || !/^[a-f\d]{64}$/i.test(signature)) {
    return false;
  }
  const expected = createHmac("sha256", signingKey).update(rawBody).digest();
  const actual = Buffer.from(signature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Server-side API client. A quote alone never creates a paid order or dispatches a courier. */
export class UberDirectClient {
  private token: { value: string; expiresAt: number } | null = null;
  private pendingToken: Promise<string> | null = null;
  private readonly config: UberDirectConfig;
  private readonly request: typeof fetch;
  private readonly now: () => number;

  constructor(
    config: UberDirectConfig,
    request: typeof fetch = fetch,
    now: () => number = Date.now,
  ) {
    if (!config.clientId || !config.clientSecret || !config.customerId) {
      throw new Error("Uber Direct credentials are incomplete.");
    }
    this.config = config;
    this.request = request;
    this.now = now;
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > this.now()) return this.token.value;
    if (this.pendingToken) return this.pendingToken;

    this.pendingToken = (async () => {
      const body = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "client_credentials",
        scope: "eats.deliveries",
      });
      const response = await this.request("https://auth.uber.com/oauth/v2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!response.ok) throw new UberDirectError(response.status, "authentication");
      const data: unknown = await response.json();
      if (!isRecord(data) || typeof data.access_token !== "string") {
        throw new Error("Uber Direct returned an invalid access token.");
      }
      const seconds = typeof data.expires_in === "number" ? data.expires_in : 0;
      if (seconds <= 60) throw new Error("Uber Direct token has no usable lifetime.");
      this.token = { value: data.access_token, expiresAt: this.now() + (seconds - 60) * 1000 };
      return data.access_token;
    })();

    try {
      return await this.pendingToken;
    } finally {
      this.pendingToken = null;
    }
  }

  private async post(path: string, body: Record<string, unknown>, operation: string): Promise<Record<string, unknown>> {
    const token = await this.accessToken();
    const response = await this.request(
      `https://api.uber.com/v1/customers/${encodeURIComponent(this.config.customerId)}/${path}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) throw new UberDirectError(response.status, operation);
    const data: unknown = await response.json();
    if (!isRecord(data)) throw new Error(`Uber Direct returned an invalid ${operation} response.`);
    return data;
  }

  async createQuote(pickupAddress: UberAddress, dropoffAddress: UberAddress): Promise<UberDirectQuote> {
    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      throw new Error("Both delivery addresses are required.");
    }
    const data = await this.post(
      "delivery_quotes",
      { pickup_address: pickupAddress, dropoff_address: dropoffAddress },
      "quote",
    );
    if (
      typeof data.id !== "string" || typeof data.expires !== "string" ||
      typeof data.fee !== "number" || !Number.isInteger(data.fee) || data.fee < 0 ||
      typeof data.currency !== "string" || typeof data.duration !== "number"
    ) {
      throw new Error("Uber Direct returned an invalid quote.");
    }
    return {
      id: data.id,
      expires: data.expires,
      feeCents: data.fee,
      currency: data.currency,
      durationMinutes: data.duration,
    };
  }

  /** Call only after a verified payment and durable order have been recorded. */
  async createDelivery(input: UberDirectDeliveryRequest): Promise<UberDirectDelivery> {
    if (!input.quoteId || !input.externalId || !input.manifestItems.length) {
      throw new Error("A quote, order ID and manifest are required to dispatch.");
    }
    if (input.manifestItems.some((item) => !item.name || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      throw new Error("The delivery manifest is invalid.");
    }
    const data = await this.post(
      "deliveries",
      {
        quote_id: input.quoteId,
        pickup_address: input.pickupAddress,
        pickup_name: input.pickupName,
        pickup_phone_number: input.pickupPhoneNumber,
        dropoff_address: input.dropoffAddress,
        dropoff_name: input.dropoffName,
        dropoff_phone_number: input.dropoffPhoneNumber,
        manifest_items: input.manifestItems,
        external_id: input.externalId,
      },
      "delivery",
    );
    if (typeof data.id !== "string" || typeof data.status !== "string" || typeof data.live_mode !== "boolean") {
      throw new Error("Uber Direct returned an invalid delivery.");
    }
    return {
      id: data.id,
      status: data.status,
      trackingUrl: typeof data.tracking_url === "string" ? data.tracking_url : null,
      liveMode: data.live_mode,
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
