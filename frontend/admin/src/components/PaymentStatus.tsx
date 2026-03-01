import { StatusIndicator } from "@cloudscape-design/components";
import type { StatusIndicatorType } from "../common/types";
import type { PaymentStatusType } from "../app/api/orders";

export const paymentStatusTypes: Record<
  PaymentStatusType,
  StatusIndicatorType
> = {
  paid: "success",
  unpaid: "in-progress",
  refunded: "warning",
};

export const paymentStatusTexts: Record<PaymentStatusType, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  refunded: "Refunded",
};

export interface PaymentStatusProps {
  status?: PaymentStatusType;
}

function PaymentStatus(props: PaymentStatusProps) {
  if (!props.status) {
    return <StatusIndicator type="not-started">Unknown</StatusIndicator>;
  }

  return (
    <StatusIndicator type={paymentStatusTypes[props.status]}>
      {paymentStatusTexts[props.status]}
    </StatusIndicator>
  );
}

export default PaymentStatus;
