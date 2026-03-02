import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { setPageLayout } from "../../app/redux/layoutSlice";
import {
  Alert,
  Box,
  Button,
  Container,
  ContentLayout,
  Header,
  KeyValuePairs,
  Modal,
  SpaceBetween,
  Spinner,
  Table,
  TextContent,
  Link,
} from "@cloudscape-design/components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/redux/store";
import {
  getOrder,
  deleteOrder,
  type IOrder,
  type IOrderItem,
} from "../../app/api/orders";
import { createTicket } from "../../app/api/tickets";
import { addFlash } from "../../app/redux/flashbarSlice";
import OrderStatus from "../../components/OrderStatus";
import PaymentStatus from "../../components/PaymentStatus";
import Time from "../../components/Time";

// --- Sub-components ---

function DeleteOrderModal({
  visible,
  onDismiss,
  onConfirm,
  isDeleting,
  orderId,
}: {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  orderId?: string;
}) {
  return (
    <Modal
      onDismiss={onDismiss}
      visible={visible}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onConfirm} loading={isDeleting}>
              Delete
            </Button>
          </SpaceBetween>
        </Box>
      }
      header="Delete order"
    >
      <SpaceBetween size="m">
        <TextContent>
          Permanently delete order <strong>{orderId}</strong>? You can't undo
          this action.
        </TextContent>
        <Alert>
          Proceeding with this action will delete the order and all its content
          and can affect related resources
        </Alert>
      </SpaceBetween>
    </Modal>
  );
}

function OrderSummaryPanel({ order }: { order: IOrder | undefined }) {
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

function OrderItemsTable({ items }: { items: IOrderItem[] }) {
  return (
    <Table<IOrderItem>
      items={items}
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
        <Header variant="h2" counter={`(${items.length})`}>
          Items
        </Header>
      }
      empty={
        <Box textAlign="center" color="inherit">
          No items
        </Box>
      }
    />
  );
}

// --- Main Page Component ---

function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useSelector((state: RootState) => state.auth.role);

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Home", href: "/" },
          { text: "Orders", href: "/orders" },
          { text: orderId!, href: `/orders/${orderId}` },
        ],
        activeHref: "/orders",
        helpPanelTopic: "order_details",
      }),
    );
  }, [dispatch, orderId]);

  const { data: order, isLoading } = useQuery({
    queryKey: [`order-${orderId}`],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOrder(orderId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigate("/orders");
    },
    onError: (error: Error) => {
      console.error("Failed to delete order", error);
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: () =>
      createTicket({
        order_id: orderId!,
        category: "general",
        priority: "low",
        status: "ai_handling",
      }),
    onSuccess: (data: { id: string }) => {
      dispatch(
        addFlash({
          type: "success",
          header: "Ticket created",
          content: "Successfully created ticket.",
          dismissible: true,
        }),
      );
      navigate(`/chat/${data.id}`);
    },
    onError: (error: Error) => {
      console.error("Failed to create ticket", error);
      dispatch(
        addFlash({
          type: "error",
          header: "Failed to create ticket",
          content: "An error occurred while creating the ticket.",
          dismissible: true,
        })
      );
    }
  });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const pageHeader = (
    <Header
      variant="h1"
      description="View comprehensive details about this order, including items, subtotal, and actions you can take."
      info={<Link variant="info" onFollow={() => dispatch({ type: 'layout/setToolsOpen', payload: true })}>Info</Link>}
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button onClick={() => navigate(`/orders/${orderId}/update`)}>
            Edit
          </Button>
          {role === "admin" && (
            <Button onClick={() => setDeleteModalVisible(true)}>Delete</Button>
          )}
          <Button variant="primary" loading={createTicketMutation.isPending} onClick={() => createTicketMutation.mutate()}>Create Ticket</Button>
        </SpaceBetween>
      }
    >
      {orderId}
    </Header>
  );

  if (isLoading) {
    return (
      <ContentLayout header={pageHeader}>
        <Container>
          <Box textAlign="center" padding="xxl">
            <Spinner size="large" />
          </Box>
        </Container>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout header={pageHeader}>
      <DeleteOrderModal
        visible={deleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        onConfirm={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
        orderId={order?.id}
      />

      <SpaceBetween size="l">
        <OrderSummaryPanel order={order} />
        <OrderItemsTable items={order?.items || []} />
      </SpaceBetween>
    </ContentLayout>
  );
}

export default OrderDetailsPage;
