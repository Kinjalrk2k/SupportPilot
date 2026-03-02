import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  ContentLayout,
  Header,
  SpaceBetween,
  Table,
  Modal,
} from "@cloudscape-design/components";
import { setPageLayout } from "../../app/redux/layoutSlice";
import { getDocuments, deleteDocument } from "../../app/api/documents";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function DeleteDocumentModal({
  visible,
  onDismiss,
  onConfirm,
  isDeleting,
  filename,
}: {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  filename?: string;
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
      header="Delete Document"
    >
      <Box>
        Are you sure you want to permanently delete{" "}
        <strong>{filename}</strong>? This action cannot be undone.
      </Box>
    </Modal>
  );
}

function DocumentsListHeader({ total }: { total?: number }) {
  const navigate = useNavigate();
  return (
    <Header
      variant="awsui-h1-sticky"
      description="Manage all knowledge documents"
      counter={`(${total !== undefined ? total : "..."})`}
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="primary" onClick={() => navigate("/documents/create")}>
            Upload Document
          </Button>
        </SpaceBetween>
      }
    >
      Documents
    </Header>
  );
}

function DocumentsListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Home", href: "/" },
          { text: "Documents", href: "/documents" },
        ],
        activeHref: "/documents",
      })
    );
  }, [dispatch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["documents"],
    queryFn: () => getDocuments(),
  });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedFilename, setSelectedFilename] = useState<string | undefined>();

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => deleteDocument(filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDeleteModalVisible(false);
    },
    onError: (error) => {
      console.error("Failed to delete document", error);
    },
  });

  const handleDeleteClick = (filename: string) => {
    setSelectedFilename(filename);
    setDeleteModalVisible(true);
  };

  const columns = [
    {
      id: "filename",
      header: "Filename",
      cell: (item: string) => <strong>{item}</strong>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (item: string) => (
        <SpaceBetween direction="horizontal" size="s">
          <Button onClick={() => navigate(`/documents/${item}/update`)}>
            Update
          </Button>
          <Button onClick={() => handleDeleteClick(item)}>Delete</Button>
        </SpaceBetween>
      ),
      minWidth: 200,
    },
  ];

  return (
    <ContentLayout>
      <DeleteDocumentModal
        visible={deleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        onConfirm={() => selectedFilename && deleteMutation.mutate(selectedFilename)}
        isDeleting={deleteMutation.isPending}
        filename={selectedFilename}
      />

      <Table<string>
        columnDefinitions={columns}
        variant="full-page"
        stickyHeader
        header={<DocumentsListHeader total={data?.documents?.length} />}
        items={data?.documents ?? []}
        loading={isLoading}
        loadingText="Loading documents"
        empty={
          isError ? (
            <Alert type="error" header="Failed to load documents">
              The list of documents could not be loaded due to a server error. Try
              again later.
            </Alert>
          ) : (
            <Box textAlign="center">
              <b>No documents found</b>
            </Box>
          )
        }
      />
    </ContentLayout>
  );
}

export default DocumentsListPage;
