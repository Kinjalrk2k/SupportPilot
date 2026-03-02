import { useEffect, useState } from "react";
import {
  Box,
  ContentLayout,
  Header,
  Link,
  Pagination,
  Table,
} from "@cloudscape-design/components";
import { useDispatch } from "react-redux";
import { setPageLayout } from "../../app/redux/layoutSlice";
import { useQuery } from "@tanstack/react-query";
import { getTickets, type ITicketResponse } from "../../app/api/tickets";
import Time from "../../components/Time";
import TicketPriority from "../../components/TicketPriority";
import TicketStatus from "../../components/TicketStatus";
import TicketCategory from "../../components/TicketCategory";

// --- Extracted Constants & Sub-components ---

const COLUMNS = [
  {
    id: "id",
    header: "Ticket ID",
    cell: (item: ITicketResponse) => (
      <Link href={`/tickets/${item.id}`}>{item.id}</Link>
    ),
    isRowHeader: true,
  },
  {
    id: "order_id",
    header: "Order ID",
    cell: (item: ITicketResponse) => (
      <Link href={`/orders/${item.order_id}`}>{item.order_id}</Link>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: (item: ITicketResponse) => (
      <TicketCategory category={item.category} />
    ),
  },
  {
    id: "priority",
    header: "Priority",
    cell: (item: ITicketResponse) => <TicketPriority status={item.priority} />,
  },
  {
    id: "status",
    header: "Status",
    cell: (item: ITicketResponse) => <TicketStatus status={item.status} />,
  },
  {
    id: "created_at",
    header: "Created At",
    cell: (item: ITicketResponse) => <Time timestamp={item.created_at} />,
  },
];

function TicketsListHeader({ total }: { total?: number }) {
  const dispatch = useDispatch();

  return (
    <Header
      variant="awsui-h1-sticky"
      description="Monitor and resolve customer support inquiries. Respond directly or escalate unresolved AI tickets to human agents."
      info={<Link variant="info" onFollow={() => dispatch({ type: 'layout/setToolsOpen', payload: true })}>Info</Link>}
      counter={`(${total || "0"})`}
    >
      Tickets
    </Header>
  );
}

function TicketsListPagination({
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

export default function TicketsListPage() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Dashboard", href: "/" },
          { text: "Tickets", href: "/tickets" },
        ],
        activeHref: "/tickets",
        helpPanelTopic: "tickets",
      }),
    );
  }, [dispatch]);

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", currentPage, pageSize],
    queryFn: () => getTickets(currentPage, pageSize),
  });

  return (
    <ContentLayout>
      <Table<ITicketResponse>
        columnDefinitions={COLUMNS}
        items={data?.items || []}
        variant="full-page"
        stickyHeader
        loading={isLoading}
        loadingText="Loading tickets"
        empty={
          <Box textAlign="center" color="inherit">
            <b>No tickets</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              No tickets to display.
            </Box>
          </Box>
        }
        header={<TicketsListHeader total={data?.total} />}
        pagination={
          <TicketsListPagination
            currentPageIndex={currentPage}
            pagesCount={data?.total_pages || 1}
            onChange={setCurrentPage}
          />
        }
      />
    </ContentLayout>
  );
}
