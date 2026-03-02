import { Box, Icon } from "@cloudscape-design/components";
import type { TicketStatusType } from "../app/api/tickets";

export default function TicketStatus(props: { status: TicketStatusType }) {
  switch (props.status) {
    case "ai_handling":
      return (
        <Box color="text-status-info">
          <Icon name="gen-ai" /> Handling
        </Box>
      );

    case "escaled_to_human":
      return (
        <Box color="text-status-error">
          <Icon name="flag" /> Escalated
        </Box>
      );

    case "human_handling":
      return (
        <Box color="text-status-warning">
          <Icon name="user-profile-active" /> Handling
        </Box>
      );

    case "closed":
      return (
        <Box color="text-status-success">
          <Icon name="check" /> Closed
        </Box>
      );

    default:
      return (
        <Box color="text-status-error">
          <Icon name="status-not-started" /> Unknown
        </Box>
      );
  }
}
