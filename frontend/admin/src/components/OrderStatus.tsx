import { StatusIndicator } from "@cloudscape-design/components";
import type { StatusIndicatorType } from "../common/types";
import type { OrderStatusType } from "../app/api/orders";

const orderStatusTypes: Record<OrderStatusType, StatusIndicatorType> = {
  pending: "pending",
  preparing: "in-progress",
  out_for_delivery: "info",
  delivered: "success",
  cancelled: "stopped",
};

const orderStatusTexts: Record<OrderStatusType, string> = {
  pending: "Pending",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export interface OrderStatusProps {
  status?: OrderStatusType;
}

function OrderStatus(props: OrderStatusProps) {
  if (!props.status) {
    return <StatusIndicator type="not-started">Unknown</StatusIndicator>;
  }

  return (
    <StatusIndicator type={orderStatusTypes[props.status]}>
      {orderStatusTexts[props.status]}
    </StatusIndicator>
  );
}

export default OrderStatus;
