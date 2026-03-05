import {
  Modal,
  Box,
  SpaceBetween,
  Button,
  TextContent,
  Alert,
} from "@cloudscape-design/components";

export interface CloseTicketModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  isClosing: boolean;
  ticketId?: string;
}

export default function CloseTicketModal({
  visible,
  onDismiss,
  onConfirm,
  isClosing,
  ticketId,
}: CloseTicketModalProps) {
  return (
    <Modal
      onDismiss={onDismiss}
      visible={visible}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={isClosing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onConfirm} loading={isClosing}>
              Close Ticket
            </Button>
          </SpaceBetween>
        </Box>
      }
      header="Close ticket"
    >
      <SpaceBetween size="m">
        <TextContent>
          Are you sure you want to close ticket <strong>{ticketId}</strong>?
        </TextContent>
        <Alert>
          Once closed, chatting will be disabled for this ticket.
        </Alert>
      </SpaceBetween>
    </Modal>
  );
}
