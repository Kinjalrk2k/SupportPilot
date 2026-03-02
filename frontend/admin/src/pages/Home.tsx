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
  PieChart,
  ColumnLayout,
} from "@cloudscape-design/components";
import { useQuery } from "@tanstack/react-query";
import { getOrderStats } from "../app/api/orders";
import { getTicketStats } from "../app/api/tickets";
import type { RootState } from "../app/redux/store";

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
                <div>
                  <SpaceBetween size="s" direction="vertical">
                    <Box variant="awsui-key-label">Total Revenue</Box>
                    <div style={{ fontSize: "40px", fontWeight: "bold" }}>
                      ${stats?.total_revenue?.toLocaleString() ?? "0"}
                    </div>
                  </SpaceBetween>
                </div>
                <div>
                  <SpaceBetween size="s" direction="vertical">
                    <Box variant="awsui-key-label">Total Orders</Box>
                    <div style={{ fontSize: "40px", fontWeight: "bold" }}>
                      {stats?.total_orders?.toLocaleString() ?? "0"}
                    </div>
                  </SpaceBetween>
                </div>
                <div>
                  <SpaceBetween size="s" direction="vertical">
                    <Box variant="awsui-key-label">Total Tickets</Box>
                    <div style={{ fontSize: "40px", fontWeight: "bold" }}>
                      {ticketStats?.total_tickets?.toLocaleString() ?? "0"}
                    </div>
                  </SpaceBetween>
                </div>
              </ColumnLayout>

              <ColumnLayout columns={2}>
                <Container
                  header={<Header variant="h3">Order Statuses</Header>}
                >
                  <PieChart
                    hideFilter
                    variant="donut"
                    size="small"
                    innerMetricValue={
                      isLoading ? "..." : String(stats?.total_orders || 0)
                    }
                    innerMetricDescription="Orders"
                    statusType={isLoading ? "loading" : "finished"}
                    data={orderChartData}
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No data available</b>
                      </Box>
                    }
                  />
                </Container>

                <Container
                  header={<Header variant="h3">Payment Statuses</Header>}
                >
                  <PieChart
                    hideFilter
                    variant="donut"
                    size="small"
                    innerMetricValue={
                      isLoading ? "..." : String(stats?.total_orders || 0)
                    }
                    innerMetricDescription="Orders"
                    statusType={isLoading ? "loading" : "finished"}
                    data={paymentChartData}
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No data available</b>
                      </Box>
                    }
                  />
                </Container>
              </ColumnLayout>

              <ColumnLayout columns={3}>
                <Container
                  header={<Header variant="h3">Ticket Statuses</Header>}
                >
                  <PieChart
                    hideFilter
                    variant="donut"
                    size="small"
                    innerMetricValue={
                      isTicketStatsLoading
                        ? "..."
                        : String(ticketStats?.total_tickets || 0)
                    }
                    innerMetricDescription="Tickets"
                    statusType={isTicketStatsLoading ? "loading" : "finished"}
                    data={ticketStatusChartData}
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No data available</b>
                      </Box>
                    }
                  />
                </Container>

                <Container
                  header={<Header variant="h3">Ticket Categories</Header>}
                >
                  <PieChart
                    hideFilter
                    variant="donut"
                    size="small"
                    innerMetricValue={
                      isTicketStatsLoading
                        ? "..."
                        : String(ticketStats?.total_tickets || 0)
                    }
                    innerMetricDescription="Tickets"
                    statusType={isTicketStatsLoading ? "loading" : "finished"}
                    data={ticketCategoryChartData}
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No data available</b>
                      </Box>
                    }
                  />
                </Container>

                <Container
                  header={<Header variant="h3">Ticket Priorities</Header>}
                >
                  <PieChart
                    hideFilter
                    variant="donut"
                    size="small"
                    innerMetricValue={
                      isTicketStatsLoading
                        ? "..."
                        : String(ticketStats?.total_tickets || 0)
                    }
                    innerMetricDescription="Tickets"
                    statusType={isTicketStatsLoading ? "loading" : "finished"}
                    data={ticketPriorityChartData}
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No data available</b>
                      </Box>
                    }
                  />
                </Container>
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
