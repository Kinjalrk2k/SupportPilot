import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  ContentLayout,
  SpaceBetween,
  Table,
} from "@cloudscape-design/components";
import { setPageLayout } from "../../app/redux/layoutSlice";
import { getDocuments, deleteDocument } from "../../app/api/documents";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import DeleteDocumentModal from "./DeleteDocumentModal";
import DocumentsListHeader from "./DocumentsListHeader";

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
        helpPanelTopic: "documents",
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
