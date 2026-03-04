import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  ContentLayout,
  Header,
  SpaceBetween,
  Spinner,
  Link,
} from "@cloudscape-design/components";
import { setPageLayout } from "../../app/redux/layoutSlice";
import { addFlash } from "../../app/redux/flashbarSlice";
import {
  deleteTicket,
  getTicket,
} from "../../app/api/tickets";
import type { RootState } from "../../app/redux/store";

import DeleteTicketModal from "./DeleteTicketModal";
import TicketSummaryPanel from "./TicketSummaryPanel";

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
        helpPanelTopic: "ticket_details",
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
      description="View full details of the customer support ticket, including status, category, and timestamps."
      info={<Link variant="info" onFollow={() => dispatch({ type: 'layout/setToolsOpen', payload: true })}>Info</Link>}
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
