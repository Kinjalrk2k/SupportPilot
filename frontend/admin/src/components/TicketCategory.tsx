import { Box, Icon } from "@cloudscape-design/components";
import type { TicketCategoryType } from "../app/api/tickets";

export default function TicketCategory(props: {
  category?: TicketCategoryType | null;
}) {
  switch (props.category) {
    case "billing":
      return (
        <Box>
          <Icon name="ticket" /> Billing
        </Box>
      );

    case "general":
      return (
        <Box>
          <Icon name="ticket" /> General
        </Box>
      );

    case "login":
      return (
        <Box>
          <Icon name="ticket" /> Login
        </Box>
      );

    case "technical":
      return (
        <Box>
          <Icon name="ticket" /> Technical
        </Box>
      );

    case "delivery":
      return (
        <Box>
          <Icon name="ticket" /> Technical
        </Box>
      );

    default:
      return (
        <Box>
          <Icon name="ticket" /> Unknown
        </Box>
      );
  }
}
