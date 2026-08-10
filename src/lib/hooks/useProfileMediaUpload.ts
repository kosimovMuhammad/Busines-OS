import { useState } from "react";
import {
  useConfirmProfileMediaMutation,
  usePresignProfileMediaMutation,
} from "@/lib/api/users.api";
import { putToS3 } from "./useFileUpload";
import type { ProfileMediaTarget, User } from "@/types/api";

// No mime-type/size validation exists on the backend for this flow, so the
// frontend enforces it before ever calling presign.
export const PROFILE_MEDIA_MAX_BYTES = 5 * 1024 * 1024;

export type ProfileMediaValidationReason = "type" | "size";

export class ProfileMediaValidationError extends Error {
  reason: ProfileMediaValidationReason;
  constructor(reason: ProfileMediaValidationReason) {
    super(reason);
    this.reason = reason;
  }
}

export function validateProfileMediaFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new ProfileMediaValidationError("type");
  }
  if (file.size > PROFILE_MEDIA_MAX_BYTES) {
    throw new ProfileMediaValidationError("size");
  }
}

// Encapsulates the presign/PUT/confirm flow shared by the avatar and cover
// uploaders on the profile page - the confirm response already carries the
// updated avatarUrl/coverUrl, so no follow-up PATCH is needed.
export function useProfileMediaUpload() {
  const [presignProfileMedia] = usePresignProfileMediaMutation();
  const [confirmProfileMedia] = useConfirmProfileMediaMutation();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File, target: ProfileMediaTarget): Promise<User> => {
    validateProfileMediaFile(file);

    setIsUploading(true);
    setProgress(0);
    try {
      const mimeType = file.type || "application/octet-stream";
      const { uploadUrl, s3Key } = await presignProfileMedia({
        filename: file.name,
        mimeType,
        target,
      }).unwrap();

      await putToS3(uploadUrl, file, setProgress);

      return await confirmProfileMedia({
        s3Key,
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
        target,
      }).unwrap();
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, progress, isUploading };
}
