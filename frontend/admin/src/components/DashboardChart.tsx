import { Box, Container, Header, PieChart } from "@cloudscape-design/components";
import type { PieChartProps } from "@cloudscape-design/components/pie-chart";

export interface DashboardChartProps {
  title: string;
  data: PieChartProps.Datum[];
  isLoading: boolean;
  totalText: string;
  totalValue: number;
}

export default function DashboardChart({
  title,
  data,
  isLoading,
  totalText,
  totalValue,
}: DashboardChartProps) {
  return (
    <Container header={<Header variant="h3">{title}</Header>}>
      <PieChart
        hideFilter
        variant="donut"
        size="small"
        innerMetricValue={isLoading ? "..." : String(totalValue)}
        innerMetricDescription={totalText}
        statusType={isLoading ? "loading" : "finished"}
        data={data}
        empty={
          <Box textAlign="center" color="inherit">
            <b>No data available</b>
          </Box>
        }
      />
    </Container>
  );
}
