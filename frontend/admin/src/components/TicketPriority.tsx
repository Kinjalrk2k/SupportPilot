import { StatusIndicator } from "@cloudscape-design/components";
import type { StatusIndicatorType } from "../common/types";
import type { TicketPriorityType } from "../app/api/tickets";

const ticketPriorityTypes: Record<TicketPriorityType, StatusIndicatorType> = {
  low: "pending",
  medium: "info",
  high: "warning",
  urgent: "error",
};

const ticketPriorityTexts: Record<TicketPriorityType, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export interface TicketPriorityProps {
  status?: TicketPriorityType | null;
}

function TicketPriority(props: TicketPriorityProps) {
  if (!props.status) {
    return <StatusIndicator type="not-started">Unknown</StatusIndicator>;
  }

  return (
    <StatusIndicator type={ticketPriorityTypes[props.status]}>
      {ticketPriorityTexts[props.status]}
    </StatusIndicator>
  );
}

export default TicketPriority;
