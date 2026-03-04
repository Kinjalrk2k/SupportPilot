import { Modal, Box, SpaceBetween, Button, TextContent, Alert } from "@cloudscape-design/components";

export interface DeleteTicketModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  ticketId?: string;
}

export default function DeleteTicketModal({
  visible,
  onDismiss,
  onConfirm,
  isDeleting,
  ticketId,
}: DeleteTicketModalProps) {
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
