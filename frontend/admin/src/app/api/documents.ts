import instance from "./instance";

export interface IDocumentListResponse {
  documents: string[];
}

export const getDocuments = async (): Promise<IDocumentListResponse> => {
  const response = await instance.get("/documents/");
  return response.data;
};

export const uploadDocument = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  await instance.post("/documents/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateDocument = async (filename: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  await instance.put(`/documents/${filename}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteDocument = async (filename: string): Promise<void> => {
  await instance.delete(`/documents/${filename}`);
};
