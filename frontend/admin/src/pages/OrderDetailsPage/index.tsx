import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { setPageLayout } from "../../app/redux/layoutSlice";
import {
  Box,
  Button,
  Container,
  ContentLayout,
  Header,
  Icon,
  KeyValuePairs,
  SpaceBetween,
  Table,
  TextContent,
} from "@cloudscape-design/components";
import { useQuery } from "@tanstack/react-query";
import { getOrder, type IOrderItem } from "../../app/api/orders";
import OrderStatus from "../../components/OrderStatus";
import PaymentStatus from "../../components/PaymentStatus";
import Time from "../../components/Time";

function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Home", href: "/" },
          { text: "Orders", href: "/orders" },
          { text: orderId!, href: `/orders/${orderId}` },
        ],
      }),
    );
  }, [dispatch]);

  const query = useQuery({
    queryKey: [`order-${orderId}`],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  });

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Edit</Button>
              <Button>Delete</Button>
            </SpaceBetween>
          }
        >
          {orderId}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Overall order summary</Header>}>
          <KeyValuePairs
            columns={3}
            items={[
              {
                type: "group",
                title: "Order",
                items: [
                  { label: "Order ID", value: query.data?.id },
                  {
                    label: "Order Status",
                    value: (
                      <SpaceBetween size="xs" direction="horizontal">
                        <OrderStatus status={query.data?.order_status} />
                        <Icon name="edit" />
                      </SpaceBetween>
                    ),
                  },
                ],
              },
              {
                type: "group",
                title: "Customer",
                items: [
                  {
                    label: "Customer Name",
                    value: query.data?.customer_name,
                  },
                  {
                    label: "Customer Phone",
                    value: query.data?.customer_phone,
                  },
                ],
              },
              {
                type: "group",
                title: "Delivery",
                items: [
                  {
                    label: "Delivery Address",
                    value: query.data?.delivery_address,
                  },
                  {
                    label: "Delivery Notes",
                    value: query.data?.delivery_notes,
                  },
                ],
              },
              {
                type: "group",
                title: "Payment",
                items: [
                  { label: "Amount", value: `₹ ${query.data?.total_amount}` },
                  {
                    label: "Payment Status",
                    value: (
                      <SpaceBetween size="xs" direction="horizontal">
                        <PaymentStatus status={query.data?.payment_status} />
                        <Icon name="edit" />
                      </SpaceBetween>
                    ),
                  },
                ],
              },
              {
                type: "group",
                title: "Timestamps",
                items: [
                  {
                    label: "Created At",
                    value: <Time timestamp={query.data?.created_at} />,
                  },
                  {
                    label: "Updated At",
                    value: <Time timestamp={query.data?.updated_at} />,
                  },
                ],
              },
            ]}
          />
        </Container>

        <Table<IOrderItem>
          items={query.data?.items || []}
          columnDefinitions={[
            {
              id: "name",
              header: "Name",
              cell: (item) => item.name,
            },
            {
              id: "qty",
              header: "Quantity",
              cell: (item) => item.qty,
            },
            {
              id: "amount",
              header: "Amount",
              cell: (item) => `₹ ${item.amount.toFixed(2)}`,
            },
          ]}
          header={
            <Header variant="h2" counter={`(${query.data?.items.length})`}>
              Items
            </Header>
          }
          empty={
            <Box textAlign="center" color="inherit">
              No items
            </Box>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
}

export default OrderDetailsPage;
