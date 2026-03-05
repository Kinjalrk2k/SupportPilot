import { Container, Header, KeyValuePairs, Link } from "@cloudscape-design/components";
import type { ITicketResponse } from "../../app/api/tickets";
import TicketStatus from "../../components/TicketStatus";
import TicketCategory from "../../components/TicketCategory";
import TicketPriority from "../../components/TicketPriority";
import Time from "../../components/Time";

export default function TicketSummaryPanel({
  ticket,
}: {
  ticket: ITicketResponse | undefined;
}) {
  return (
    <Container header={<Header variant="h2">Ticket Details</Header>}>
      <KeyValuePairs
        columns={3}
        items={[
          {
            type: "group",
            title: "Ticket",
            items: [
              { label: "Ticket ID", value: ticket?.id },
              {
                label: "Ticket Status",
                value: ticket ? <TicketStatus status={ticket.status} /> : "-",
              },
            ],
          },
          {
            type: "group",
            title: "Details",
            items: [
              {
                label: "Order ID",
                value: (
                  <Link href={`/orders/${ticket?.order_id}`}>
                    {ticket?.order_id}
                  </Link>
                ),
              },
              {
                label: "Category",
                value: ticket ? (
                  <TicketCategory category={ticket.category} />
                ) : (
                  "-"
                ),
              },
              {
                label: "Priority",
                value: ticket ? (
                  <TicketPriority status={ticket.priority} />
                ) : (
                  "-"
                ),
              },
            ],
          },
          {
            type: "group",
            title: "Timestamps",
            items: [
              {
                label: "Created At",
                value: <Time timestamp={ticket?.created_at} />,
              },
              {
                label: "Updated At",
                value: <Time timestamp={ticket?.updated_at} />,
              },
            ],
          },
        ]}
      />
    </Container>
  );
}
