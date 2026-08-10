import { useState } from "react";
import { useConfirmFileMutation, usePresignUploadMutation } from "@/lib/api/files.api";
import type { FileAsset } from "@/types/api";

type UploadTarget = { contactId?: string; dealId?: string; invoiceId?: string };

export function putToS3(url: string, file: File, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`S3 upload failed with status ${xhr.status}`));
    xhr.onerror = () => reject(new Error("S3 upload failed"));
    xhr.send(file);
  });
}

// Encapsulates the 3-step presign/PUT/confirm flow (TZ §8.5) so every
// module (Contacts, Deals, Invoices) reuses it identically.
export function useFileUpload() {
  const [presignUpload] = usePresignUploadMutation();
  const [confirmFile] = useConfirmFileMutation();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File, target: UploadTarget): Promise<FileAsset> => {
    setIsUploading(true);
    setProgress(0);
    try {
      const mimeType = file.type || "application/octet-stream";
      const { uploadUrl, s3Key } = await presignUpload({
        filename: file.name,
        mimeType,
        ...target,
      }).unwrap();

      await putToS3(uploadUrl, file, setProgress);

      return await confirmFile({
        s3Key,
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
        ...target,
      }).unwrap();
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, progress, isUploading };
}
