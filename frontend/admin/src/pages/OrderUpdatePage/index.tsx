import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setPageLayout } from "../../app/redux/layoutSlice";
import {
  Box,
  Container,
  ContentLayout,
  Header,
  Spinner,
} from "@cloudscape-design/components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrder,
  updateOrder,
  type IOrderCreate,
} from "../../app/api/orders";
import OrderForm from "../../components/OrderForm";

function OrderUpdatePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Home", href: "/" },
          { text: "Orders", href: "/orders" },
          { text: orderId!, href: `/orders/${orderId}` },
          { text: "Edit", href: `/orders/${orderId}/update` },
        ],
      }),
    );
  }, [dispatch, orderId]);

  const { data: order, isLoading: isFetching } = useQuery({
    queryKey: [`order-${orderId}`],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  });

  const mutation = useMutation({
    mutationFn: (updatedOrder: IOrderCreate) =>
      updateOrder(orderId!, updatedOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`order-${orderId}`] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Redirect back to the order details page
      navigate(`/orders/${orderId}`);
    },
    onError: (error) => {
      console.error("Failed to update order", error);
    },
  });

  const pageHeader = <Header variant="h1">Edit Order: {orderId}</Header>;

  if (isFetching) {
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

  if (!order) {
    return (
      <ContentLayout header={pageHeader}>
        <Container>
          <Box textAlign="center" padding="xxl" color="text-status-error">
            Order not found.
          </Box>
        </Container>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout header={pageHeader}>
      <OrderForm
        initialValues={order}
        onSubmit={(values) => mutation.mutate(values)}
        onCancel={() => navigate(`/orders/${orderId}`)}
        isLoading={mutation.isPending}
        submitText="Save Changes"
        headerText="Order Information"
      />
    </ContentLayout>
  );
}

export default OrderUpdatePage;
