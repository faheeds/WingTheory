import type { OrderStatus } from "./data";

const next: Record<OrderStatus, OrderStatus> = {
  NEW: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "COMPLETED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
};

const trackingStages: Record<OrderStatus, number> = {
  NEW: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY: 4,
  OUT_FOR_DELIVERY: 5,
  COMPLETED: 6,
  CANCELLED: 0,
  REJECTED: 0,
};

export const nextOrderStatus = (status: OrderStatus): OrderStatus =>
  next[status];
export const trackingStage = (status: OrderStatus) => trackingStages[status];
export const canRequestCancellation = (status: OrderStatus) =>
  status === "NEW" || status === "CONFIRMED";
