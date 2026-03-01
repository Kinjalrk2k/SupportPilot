import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Alert,
  Box,
  Button,
  ContentLayout,
  Header,
  Link,
  Pagination,
  SpaceBetween,
  Table,
} from "@cloudscape-design/components";
import moment from "moment";
import { setPageLayout } from "../../app/redux/layoutSlice";
import { getOrders, type IOrder } from "../../app/api/orders";
import { useQuery } from "@tanstack/react-query";
import OrderStatus from "../../components/OrderStatus";
import PaymentStatus from "../../components/PaymentStatus";
import Time from "../../components/Time";

function OrdersListPage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Home", href: "/" },
          { text: "Orders", href: "/orders" },
        ],
      }),
    );
  }, [dispatch]);

  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["orders", { page }],
    queryFn: () => getOrders(page),
  });

  const columns = [
    {
      id: "id",
      header: "Order ID",
      cell: (item: IOrder) => (
        <Link href={`/orders/${item.id}`}>{item.id}</Link>
      ),
    },
    {
      id: "customer_name",
      header: "Customer Name",
      cell: (item: IOrder) => item.customer_name,
    },
    {
      id: "customer_phone",
      header: "Customer Phone",
      cell: (item: IOrder) => item.customer_phone,
    },
    {
      id: "total_amount",
      header: "Total Amount",
      cell: (item: IOrder) => `₹ ${item.total_amount}`,
    },
    {
      id: "order_status",
      header: "Order Status",
      cell: (item: IOrder) => <OrderStatus status={item.order_status} />,
    },
    {
      id: "payment_status",
      header: "Payment Status",
      cell: (item: IOrder) => <PaymentStatus status={item.payment_status} />,
    },
    {
      id: "created_at",
      header: "Created At",
      cell: (item: IOrder) => <Time timestamp={item.created_at} />,
    },
  ];

  return (
    <ContentLayout>
      <Table<IOrder>
        columnDefinitions={columns}
        variant="full-page"
        stickyHeader
        header={
          <Header
            variant="awsui-h1-sticky"
            description="Manage all orders"
            counter={`(${query.data?.total || "..."})`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="primary">Create Order</Button>
              </SpaceBetween>
            }
          >
            Orders
          </Header>
        }
        items={query.data?.items ?? []}
        loading={query.isLoading}
        loadingText="Loading orders"
        empty={
          query.isError ? (
            <Alert type="error" header="Failed to load orders">
              The list of orders could not be loaded due to a server error. Try
              again later.
            </Alert>
          ) : (
            <Box textAlign="center">
              <b>No orders found</b>
            </Box>
          )
        }
        pagination={
          <Pagination
            currentPageIndex={query.data?.page ?? 1}
            pagesCount={query.data?.total_pages ?? 1}
            onChange={(e) => setPage(e.detail.currentPageIndex)}
          />
        }
      />
    </ContentLayout>
  );
}

export default OrdersListPage;
