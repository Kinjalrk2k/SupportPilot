import { Modal, Box, SpaceBetween, Button, TextContent, Alert } from "@cloudscape-design/components";

export interface DeleteOrderModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  orderId?: string;
}

export default function DeleteOrderModal({
  visible,
  onDismiss,
  onConfirm,
  isDeleting,
  orderId,
}: DeleteOrderModalProps) {
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
      header="Delete order"
    >
      <SpaceBetween size="m">
        <TextContent>
          Permanently delete order <strong>{orderId}</strong>? You can't undo
          this action.
        </TextContent>
        <Alert>
          Proceeding with this action will delete the order and all its content
          and can affect related resources
        </Alert>
      </SpaceBetween>
    </Modal>
  );
}
