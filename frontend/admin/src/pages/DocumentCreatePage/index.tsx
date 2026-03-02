import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  ContentLayout,
  FileUpload,
  Form,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import { setPageLayout } from "../../app/redux/layoutSlice";
import { uploadDocument } from "../../app/api/documents";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function DocumentCreatePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [
          { text: "Home", href: "/" },
          { text: "Documents", href: "/documents" },
          { text: "Upload Document", href: "/documents/create" },
        ],
        activeHref: "/documents",
      })
    );
  }, [dispatch]);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      navigate("/documents");
    },
    onError: (error) => {
      console.error("Failed to upload document", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length > 0) {
      mutation.mutate(files[0]);
    }
  };

  return (
    <ContentLayout header={<Header variant="h1">Upload Document</Header>}>
      <form onSubmit={handleSubmit}>
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button formAction="none" variant="link" onClick={() => navigate("/documents")}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={mutation.isPending}
                disabled={files.length === 0 || mutation.isPending}
              >
                Upload
              </Button>
            </SpaceBetween>
          }
        >
          <Container header={<Header variant="h2">Document Information</Header>}>
            <SpaceBetween size="l">
              <FileUpload
                onChange={({ detail }) => setFiles(detail.value)}
                value={files}
                i18nStrings={{
                  uploadButtonText: (e) => (e ? "Choose files" : "Choose file"),
                  dropzoneText: (e) =>
                    e ? "Drop files to upload" : "Drop file to upload",
                  removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
                  limitShowFewer: "Show fewer files",
                  limitShowMore: "Show more files",
                  errorIconAriaLabel: "Error",
                  formatFileSize: (size) =>
                    size >= 1e9
                      ? `${(size / 1e9).toFixed(1)} GB`
                      : size >= 1e6
                      ? `${(size / 1e6).toFixed(1)} MB`
                      : size >= 1e3
                      ? `${(size / 1e3).toFixed(1)} KB`
                      : `${size} B`,
                }}
                showFileLastModified
                showFileSize
                showFileThumbnail
                tokenLimit={3}
                constraintText="Upload a markdown file (.md, .mdx)."
                accept=".md,.mdx"
              />
            </SpaceBetween>
          </Container>
        </Form>
      </form>
    </ContentLayout>
  );
}

export default DocumentCreatePage;
