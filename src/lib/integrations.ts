import type { OrderStatus } from "./data";

export type DeliveryProviderId = "direct" | "doordash" | "ubereats" | "grubhub";
export type ConnectionState =
  "demo" | "not_connected" | "sync_error" | "connected";
export type ProviderHealth = {
  id: DeliveryProviderId;
  name: string;
  state: ConnectionState;
  lastMenuSync: Date | null;
  openErrors: number;
};
export type ProviderOrder = {
  providerOrderId: string;
  channel: DeliveryProviderId;
  itemIds: string[];
  specialInstructions?: string;
};
export type DeliveryQuote = {
  feeCents: number;
  earliestMinutes: number;
  latestMinutes: number;
};

export interface DeliveryProvider {
  readonly id: DeliveryProviderId;
  health(): Promise<ProviderHealth>;
  syncMenu(itemIds: string[]): Promise<void>;
  ingestOrder(payload: unknown, signature: string): Promise<ProviderOrder>;
  updateOrderStatus(
    providerOrderId: string,
    status: OrderStatus,
  ): Promise<void>;
  setPaused(paused: boolean): Promise<void>;
  quoteDelivery(address: string): Promise<DeliveryQuote>;
  dispatch(providerOrderId: string): Promise<string>;
  getTracking(
    dispatchId: string,
  ): Promise<{ status: string; etaMinutes: number | null }>;
  getCommissionReport(start: Date, end: Date): Promise<{ amountCents: number }>;
}

export class ProviderNotConnectedError extends Error {
  constructor(provider: string) {
    super(
      `${provider} is not connected. Configure and verify the provider before calling it.`,
    );
    this.name = "ProviderNotConnectedError";
  }
}

export class UnconfiguredDeliveryProvider implements DeliveryProvider {
  constructor(readonly id: DeliveryProviderId) {}
  async health(): Promise<ProviderHealth> {
    return {
      id: this.id,
      name: providerNames[this.id],
      state: "not_connected",
      lastMenuSync: null,
      openErrors: 0,
    };
  }
  private unavailable(): never {
    throw new ProviderNotConnectedError(providerNames[this.id]);
  }
  async syncMenu(_itemIds: string[]): Promise<void> {
    this.unavailable();
  }
  async ingestOrder(
    _payload: unknown,
    _signature: string,
  ): Promise<ProviderOrder> {
    return this.unavailable();
  }
  async updateOrderStatus(
    _providerOrderId: string,
    _status: OrderStatus,
  ): Promise<void> {
    this.unavailable();
  }
  async setPaused(_paused: boolean): Promise<void> {
    this.unavailable();
  }
  async quoteDelivery(_address: string): Promise<DeliveryQuote> {
    return this.unavailable();
  }
  async dispatch(_providerOrderId: string): Promise<string> {
    return this.unavailable();
  }
  async getTracking(
    _dispatchId: string,
  ): Promise<{ status: string; etaMinutes: number | null }> {
    return this.unavailable();
  }
  async getCommissionReport(
    _start: Date,
    _end: Date,
  ): Promise<{ amountCents: number }> {
    return this.unavailable();
  }
}

export const providerNames: Record<DeliveryProviderId, string> = {
  direct: "Direct delivery",
  doordash: "DoorDash",
  ubereats: "Uber Eats",
  grubhub: "Grubhub",
};
export const posProviders = [
  "Toast",
  "Square",
  "Clover",
  "Oracle MICROS",
] as const;
