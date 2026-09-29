import { neon } from "@neondatabase/serverless";

export function orderDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Order database is not configured.");
  return neon(url);
}
