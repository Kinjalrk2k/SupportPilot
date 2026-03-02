import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPageLayout } from "../../app/redux/layoutSlice";
import { ContentLayout, Header } from "@cloudscape-design/components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, type IOrderCreate } from "../../app/api/orders";
import OrderForm from "../../components/OrderForm";

function OrderCreatePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Home", href: "/" },
          { text: "Orders", href: "/orders" },
          { text: "Create Order", href: `/orders/create` },
        ],
        activeHref: "/orders",
      }),
    );
  }, [dispatch]);

  const mutation = useMutation({
    mutationFn: (newOrder: IOrderCreate) => createOrder(newOrder),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Redirect to the new order details page
      navigate(`/orders/${data.id}`);
    },
    onError: (error) => {
      console.error("Failed to create order", error);
    },
  });

  return (
    <ContentLayout header={<Header variant="h1">Create Order</Header>}>
      <OrderForm
        onSubmit={(values) => mutation.mutate(values)}
        onCancel={() => navigate("/orders")}
        isLoading={mutation.isPending}
        submitText="Create"
        headerText="Order Information"
      />
    </ContentLayout>
  );
}

export default OrderCreatePage;
