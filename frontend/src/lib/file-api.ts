import { resolveFileBaseUrl } from "@/lib/api-base";
import { API_ROUTES } from "@/lib/api-routes";

export type FileAsset = {
  id: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: number;
  createdAt: string;
};

export async function uploadFile(file: File, token?: string): Promise<FileAsset> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${resolveFileBaseUrl()}${API_ROUTES.files}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Upload failed");
  }

  return response.json();
}
