import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Container,
  Form,
  FormField,
  Header,
  Select,
  SpaceBetween,
  Spinner,
} from "@cloudscape-design/components";
import { setPageLayout } from "../../app/redux/layoutSlice";
import { addFlash } from "../../app/redux/flashbarSlice";
import { getTicket, updateTicket, type ITicketUpdate } from "../../app/api/tickets";

const CATEGORY_OPTIONS = [
  { label: "Billing", value: "billing" },
  { label: "Technical", value: "technical" },
  { label: "Login", value: "login" },
  { label: "General", value: "general" },
];

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const STATUS_OPTIONS = [
  { label: "AI Handling", value: "ai_handling" },
  { label: "Escalated to Human", value: "escaled_to_human" },
  { label: "Human Handling", value: "human_handling" },
  { label: "Closed", value: "closed" },
];

export default function TicketUpdatePage() {
  const { ticketId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState<ITicketUpdate>({
    category: null,
    priority: null,
    status: null,
  });

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Dashboard", href: "/" },
          { text: "Tickets", href: "/tickets" },
          { text: ticketId || "Details", href: `/tickets/${ticketId}` },
          { text: "Update", href: `/tickets/${ticketId}/update` },
        ],
        activeHref: "/tickets",
      }),
    );
  }, [dispatch, ticketId]);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId!),
    enabled: !!ticketId,
  });

  useEffect(() => {
    if (ticket) {
      setValues({
        category: ticket.category || null,
        priority: ticket.priority || null,
        status: ticket.status || null,
      });
    }
  }, [ticket]);

  const mutation = useMutation({
    mutationFn: (updateData: ITicketUpdate) =>
      updateTicket(ticketId!, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      dispatch(
        addFlash({
          type: "success",
          header: "Ticket updated",
          content: "Successfully updated the ticket.",
          dismissible: true,
        }),
      );
      navigate(`/tickets/${ticketId}`);
    },
    onError: () => {
      dispatch(
        addFlash({
          type: "error",
          header: "Update failed",
          content: "An error occurred while updating the ticket.",
          dismissible: true,
        }),
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(values);
  };

  if (isLoading) {
    return <Spinner size="large" />;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <SpaceBetween size="l">
      <Header variant="h1">Update Ticket: {ticket.id.slice(0, 8)}</Header>

      <form onSubmit={handleSubmit}>
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                formAction="none"
                variant="link"
                onClick={() => navigate(`/tickets/${ticketId}`)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={mutation.isPending}
                disabled={mutation.isPending}
              >
                Save changes
              </Button>
            </SpaceBetween>
          }
        >
          <Container>
            <SpaceBetween size="l">
              <FormField label="Category">
                <Select
                  selectedOption={
                    CATEGORY_OPTIONS.find(
                      (opt) => opt.value === values.category,
                    ) || null
                  }
                  onChange={({ detail }) =>
                    setValues((prev) => ({
                      ...prev,
                      category: detail.selectedOption.value as any,
                    }))
                  }
                  options={CATEGORY_OPTIONS}
                />
              </FormField>

              <FormField label="Priority">
                <Select
                  selectedOption={
                    PRIORITY_OPTIONS.find(
                      (opt) => opt.value === values.priority,
                    ) || null
                  }
                  onChange={({ detail }) =>
                    setValues((prev) => ({
                      ...prev,
                      priority: detail.selectedOption.value as any,
                    }))
                  }
                  options={PRIORITY_OPTIONS}
                />
              </FormField>

              <FormField label="Status">
                <Select
                  selectedOption={
                    STATUS_OPTIONS.find((opt) => opt.value === values.status) ||
                    null
                  }
                  onChange={({ detail }) =>
                    setValues((prev) => ({
                      ...prev,
                      status: detail.selectedOption.value as any,
                    }))
                  }
                  options={STATUS_OPTIONS}
                />
              </FormField>
            </SpaceBetween>
          </Container>
        </Form>
      </form>
    </SpaceBetween>
  );
}
