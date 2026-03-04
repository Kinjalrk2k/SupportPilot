import { Container, Header, KeyValuePairs } from "@cloudscape-design/components";
import type { IOrder } from "../../app/api/orders";
import OrderStatus from "../../components/OrderStatus";
import PaymentStatus from "../../components/PaymentStatus";
import Time from "../../components/Time";

export default function OrderSummaryPanel({ order }: { order: IOrder | undefined }) {
  return (
    <Container header={<Header variant="h2">Overall order summary</Header>}>
      <KeyValuePairs
        columns={3}
        items={[
          {
            type: "group",
            title: "Order",
            items: [
              { label: "Order ID", value: order?.id },
              {
                label: "Order Status",
                value: <OrderStatus status={order?.order_status} />,
              },
            ],
          },
          {
            type: "group",
            title: "Customer",
            items: [
              {
                label: "Customer Name",
                value: order?.customer_name,
              },
              {
                label: "Customer Phone",
                value: order?.customer_phone,
              },
            ],
          },
          {
            type: "group",
            title: "Delivery",
            items: [
              {
                label: "Delivery Address",
                value: order?.delivery_address,
              },
              {
                label: "Delivery Notes",
                value: order?.delivery_notes,
              },
            ],
          },
          {
            type: "group",
            title: "Payment",
            items: [
              { label: "Amount", value: `₹ ${order?.total_amount}` },
              {
                label: "Payment Status",
                value: <PaymentStatus status={order?.payment_status} />,
              },
            ],
          },
          {
            type: "group",
            title: "Timestamps",
            items: [
              {
                label: "Created At",
                value: <Time timestamp={order?.created_at} />,
              },
              {
                label: "Updated At",
                value: <Time timestamp={order?.updated_at} />,
              },
            ],
          },
        ]}
      />
    </Container>
  );
}
