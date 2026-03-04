import { Box, SpaceBetween } from "@cloudscape-design/components";

export interface StatCardProps {
  title: string;
  value: string | number;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div>
      <SpaceBetween size="s" direction="vertical">
        <Box variant="awsui-key-label">{title}</Box>
        <div style={{ fontSize: "40px", fontWeight: "bold" }}>{value}</div>
      </SpaceBetween>
    </div>
  );
}
