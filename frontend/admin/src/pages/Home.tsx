import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageLayout } from "../app/redux/layoutSlice";
import { useNavigate } from "react-router-dom";
import {
  ContentLayout,
  Header,
  SpaceBetween,
  Button,
  Container,
  Grid,
  TextContent,
  Box,
  ColumnLayout,
} from "@cloudscape-design/components";
import { useQuery } from "@tanstack/react-query";
import { getOrderStats } from "../app/api/orders";
import { getTicketStats } from "../app/api/tickets";
import type { RootState } from "../app/redux/store";
import StatCard from "../components/StatCard";
import DashboardChart from "../components/DashboardChart";

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => state.auth.role);

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [{ text: "Home", href: "/" }],
        activeHref: "/",
        helpPanelTopic: "home",
      }),
    );
  }, [dispatch]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["orderStats"],
    queryFn: getOrderStats,
  });

  const orderChartData = stats
    ? Object.entries(stats.order_status_counts).map(([status, count]) => ({
        title: status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        value: count,
      }))
    : [];

  const paymentChartData = stats
    ? Object.entries(stats.payment_status_counts).map(([status, count]) => ({
        title: status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        value: count,
      }))
    : [];

  const { data: ticketStats, isLoading: isTicketStatsLoading } = useQuery({
    queryKey: ["ticketStats"],
    queryFn: getTicketStats,
  });

  const ticketStatusChartData = ticketStats
    ? Object.entries(ticketStats.status_counts).map(([status, count]) => ({
        title: status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        value: count,
      }))
    : [];

  const ticketCategoryChartData = ticketStats
    ? Object.entries(ticketStats.category_counts).map(([status, count]) => ({
        title: status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        value: count,
      }))
    : [];

  const ticketPriorityChartData = ticketStats
    ? Object.entries(ticketStats.priority_counts).map(([status, count]) => ({
        title: status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        value: count,
      }))
    : [];

  return (
    <ContentLayout
      headerVariant="high-contrast"
      headerBackgroundStyle={(mode) =>
        `center center/cover url("https://cloudscape.design/hero-header-${mode}.png")`
      }
      // header={
      //   <Box padding={{ vertical: "xxxl" }}>
      //     <Grid gridDefinition={[{ colspan: { default: 12, s: 8 } }]}>
      //       <Header
      //         variant="h1"
      //         description="Manage your support tickets, orders, and interact with the AI assistant seamlessly. SupportPilot provides all the tools you need to deliver an excellent customer experience."
      //       >
      //         Welcome to SupportPilot
      //       </Header>
      //     </Grid>
      //   </Box>
      // }

      header={
        <Box padding={{ vertical: "xxxl" }}>
          <Grid gridDefinition={[{ colspan: { default: 12, s: 8 } }]}>
            <Container>
              <Box padding="s">
                <Box
                  fontSize="display-l"
                  fontWeight="bold"
                  variant="h1"
                  padding="n"
                >
                  Welcome to SupportPilot
                </Box>
                <Box fontSize="heading-xl" fontWeight="light">
                  For your tickets
                </Box>
                <Box
                  variant="p"
                  color="text-body-secondary"
                  margin={{ top: "xs", bottom: "l" }}
                >
                  Manage your support tickets, orders, and interact with the AI
                  assistant seamlessly. SupportPilot provides all the tools you
                  need to deliver an excellent customer experience.
                </Box>
              </Box>
            </Container>
          </Grid>
        </Box>
      }
    >
      <SpaceBetween size="l">
        <Grid
          gridDefinition={[
            { colspan: { default: 12, s: 6 } },
            { colspan: { default: 12, s: 6 } },
          ]}
        >
          <Container header={<Header variant="h2">Orders Management</Header>}>
            <TextContent>
              <p>
                Efficiently manage all customer orders. View details, track
                statuses, and proactively identify issues before they escalate.
              </p>
            </TextContent>
            <Box margin={{ top: "l" }}>
              <Button onClick={() => navigate("/orders")}>Go to Orders</Button>
            </Box>
          </Container>

          <Container header={<Header variant="h2">Ticket Resolution</Header>}>
            <TextContent>
              <p>
                Handle customer inquiries and support tickets. Leverage our AI
                assistant to quickly draft responses, or escalate to human
                agents when needed.
              </p>
            </TextContent>
            <Box margin={{ top: "l" }}>
              <Button onClick={() => navigate("/tickets")}>
                Go to Tickets
              </Button>
            </Box>
          </Container>
        </Grid>

        {role === "admin" ? (
          <Container header={<Header variant="h2">Dashboard Overview</Header>}>
            <SpaceBetween size="xl">
              <ColumnLayout columns={3} variant="text-grid">
                <StatCard
                  title="Total Revenue"
                  value={`$${stats?.total_revenue?.toLocaleString() ?? "0"}`}
                />
                <StatCard
                  title="Total Orders"
                  value={stats?.total_orders?.toLocaleString() ?? "0"}
                />
                <StatCard
                  title="Total Tickets"
                  value={ticketStats?.total_tickets?.toLocaleString() ?? "0"}
                />
              </ColumnLayout>

              <ColumnLayout columns={2}>
                <DashboardChart
                  title="Order Statuses"
                  data={orderChartData}
                  isLoading={isLoading}
                  totalText="Orders"
                  totalValue={stats?.total_orders || 0}
                />
                <DashboardChart
                  title="Payment Statuses"
                  data={paymentChartData}
                  isLoading={isLoading}
                  totalText="Orders"
                  totalValue={stats?.total_orders || 0}
                />
              </ColumnLayout>

              <ColumnLayout columns={3}>
                <DashboardChart
                  title="Ticket Statuses"
                  data={ticketStatusChartData}
                  isLoading={isTicketStatsLoading}
                  totalText="Tickets"
                  totalValue={ticketStats?.total_tickets || 0}
                />
                <DashboardChart
                  title="Ticket Categories"
                  data={ticketCategoryChartData}
                  isLoading={isTicketStatsLoading}
                  totalText="Tickets"
                  totalValue={ticketStats?.total_tickets || 0}
                />
                <DashboardChart
                  title="Ticket Priorities"
                  data={ticketPriorityChartData}
                  isLoading={isTicketStatsLoading}
                  totalText="Tickets"
                  totalValue={ticketStats?.total_tickets || 0}
                />
              </ColumnLayout>
            </SpaceBetween>
          </Container>
        ) : (
          <></>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}

export default HomePage;
