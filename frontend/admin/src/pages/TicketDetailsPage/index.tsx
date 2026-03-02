import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Container,
  ContentLayout,
  Header,
  KeyValuePairs,
  Modal,
  SpaceBetween,
  Spinner,
  Link,
  TextContent,
} from "@cloudscape-design/components";
import { setPageLayout } from "../../app/redux/layoutSlice";
import { addFlash } from "../../app/redux/flashbarSlice";
import {
  deleteTicket,
  getTicket,
  type ITicketResponse,
} from "../../app/api/tickets";
import TicketStatus from "../../components/TicketStatus";
import TicketCategory from "../../components/TicketCategory";
import TicketPriority from "../../components/TicketPriority";
import Time from "../../components/Time";
import type { RootState } from "../../app/redux/store";

// --- Sub-components ---

function DeleteTicketModal({
  visible,
  onDismiss,
  onConfirm,
  isDeleting,
  ticketId,
}: {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  ticketId?: string;
}) {
  return (
    <Modal
      onDismiss={onDismiss}
      visible={visible}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onConfirm} loading={isDeleting}>
              Delete
            </Button>
          </SpaceBetween>
        </Box>
      }
      header="Delete ticket"
    >
      <SpaceBetween size="m">
        <TextContent>
          Permanently delete ticket <strong>{ticketId}</strong>? You can't undo
          this action.
        </TextContent>
        <Alert>
          Proceeding with this action will delete the ticket and all its
          messages.
        </Alert>
      </SpaceBetween>
    </Modal>
  );
}

function TicketSummaryPanel({
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

// --- Main Page Component ---

export default function TicketDetailsPage() {
  const { ticketId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useSelector((state: RootState) => state.auth.role);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Dashboard", href: "/" },
          { text: "Tickets", href: "/tickets" },
          { text: ticketId || "Details", href: `/tickets/${ticketId}` },
        ],
        activeHref: "/tickets",
      }),
    );
  }, [dispatch, ticketId]);

  const { data: ticket, isLoading: isLoadingTicket } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId!),
    enabled: !!ticketId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicket(ticketId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      dispatch(
        addFlash({
          type: "success",
          header: "Ticket deleted",
          content: "Successfully deleted ticket.",
          dismissible: true,
        }),
      );
      navigate("/tickets");
    },
    onError: () => {
      dispatch(
        addFlash({
          type: "error",
          header: "Failed to delete ticket",
          content: "An error occurred while deleting the ticket.",
          dismissible: true,
        }),
      );
    },
  });

  if (isLoadingTicket) {
    return <Spinner size="large" />;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  const pageHeader = (
    <Header
      variant="h1"
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          {role === "admin" && (
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => navigate(`/tickets/${ticketId}/update`)}>
                Edit
              </Button>
              <Button onClick={() => setDeleteModalVisible(true)}>
                Delete
              </Button>
            </SpaceBetween>
          )}
          <Button variant="primary" href={`/chat/${ticketId}`}>
            Chat
          </Button>
        </SpaceBetween>
      }
    >
      Ticket: {ticket.id}
    </Header>
  );

  return (
    <ContentLayout header={pageHeader}>
      <DeleteTicketModal
        visible={deleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        onConfirm={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
        ticketId={ticket?.id}
      />

      <SpaceBetween size="l">
        <TicketSummaryPanel ticket={ticket} />
      </SpaceBetween>
    </ContentLayout>
  );
}
