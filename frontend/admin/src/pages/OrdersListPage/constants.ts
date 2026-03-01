import type { OrderStatusType, PaymentStatusType } from "../../app/api/orders";
import type { StatusIndicatorType } from "../../common/types";

export const orderStatusTypes: Record<OrderStatusType, StatusIndicatorType> = {
  pending: "pending",
  preparing: "in-progress",
  out_for_delivery: "info",
  delivered: "success",
  cancelled: "stopped",
};

export const paymentStatusTypes: Record<
  PaymentStatusType,
  StatusIndicatorType
> = {
  paid: "success",
  unpaid: "in-progress",
  refunded: "warning",
};

export const orderStatusTexts: Record<OrderStatusType, string> = {
  pending: "Pending",
  preparing: "In Progress",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const paymentStatusTexts: Record<PaymentStatusType, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  refunded: "Refunded",
};
