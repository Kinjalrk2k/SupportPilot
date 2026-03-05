import {
  Modal,
  Box,
  SpaceBetween,
  Button,
} from "@cloudscape-design/components";

export interface DeleteDocumentModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  filename?: string;
}

export default function DeleteDocumentModal({
  visible,
  onDismiss,
  onConfirm,
  isDeleting,
  filename,
}: DeleteDocumentModalProps) {
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
      header="Delete Document"
    >
      <Box>
        Are you sure you want to permanently delete{" "}
        <strong>{filename}</strong>? This action cannot be undone.
      </Box>
    </Modal>
  );
}
