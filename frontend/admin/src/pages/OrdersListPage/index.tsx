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
import { setPageLayout } from "../../app/redux/layoutSlice";
import { getOrders, type IOrder } from "../../app/api/orders";
import { useQuery } from "@tanstack/react-query";
import OrderStatus from "../../components/OrderStatus";
import PaymentStatus from "../../components/PaymentStatus";
import Time from "../../components/Time";

// --- Extracted Constants & Sub-components ---

const COLUMNS = [
  {
    id: "id",
    header: "Order ID",
    cell: (item: IOrder) => <Link href={`/orders/${item.id}`}>{item.id}</Link>,
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

function OrdersListHeader({ total }: { total?: number }) {
  const dispatch = useDispatch();

  return (
    <Header
      variant="awsui-h1-sticky"
      description="View and manage customer orders. You can track their fulfillment status, payment status, and modify details if necessary."
      info={<Link variant="info" onFollow={() => dispatch({ type: 'layout/setToolsOpen', payload: true })}>Info</Link>}
      counter={`(${total || "..."})`}
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="primary" href="/orders/create">
            Create Order
          </Button>
        </SpaceBetween>
      }
    >
      Orders
    </Header>
  );
}

function OrdersListPagination({
  currentPageIndex,
  pagesCount,
  onChange,
}: {
  currentPageIndex: number;
  pagesCount: number;
  onChange: (page: number) => void;
}) {
  return (
    <Pagination
      currentPageIndex={currentPageIndex}
      pagesCount={pagesCount}
      onChange={(e) => onChange(e.detail.currentPageIndex)}
    />
  );
}

// --- Main Page Component ---

function OrdersListPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Home", href: "/" },
          { text: "Orders", href: "/orders" },
        ],
        activeHref: "/orders",
        helpPanelTopic: "orders",
      }),
    );
  }, [dispatch]);

  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["orders", { page }],
    queryFn: () => getOrders(page),
  });

  return (
    <ContentLayout>
      <Table<IOrder>
        columnDefinitions={COLUMNS}
        variant="full-page"
        stickyHeader
        header={<OrdersListHeader total={query.data?.total} />}
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
          <OrdersListPagination
            currentPageIndex={query.data?.page ?? 1}
            pagesCount={query.data?.total_pages ?? 1}
            onChange={setPage}
          />
        }
      />
    </ContentLayout>
  );
}

export default OrdersListPage;
