"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Camera, ImageOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDeleteProfileMediaMutation } from "@/lib/api/users.api";
import {
  ProfileMediaValidationError,
  useProfileMediaUpload,
} from "@/lib/hooks/useProfileMediaUpload";
import { cn, initials } from "@/lib/utils";
import type { ProfileMediaTarget } from "@/types/api";

export function EditPhotoDialog({
  target,
  open,
  onOpenChange,
  imageUrl,
  userName,
}: {
  target: ProfileMediaTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  userName: string;
}) {
  const t = useTranslations("pages.settingsProfile");
  const { upload, progress, isUploading } = useProfileMediaUpload();
  const [deleteProfileMedia, { isLoading: isDeleting }] = useDeleteProfileMediaMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAvatar = target === "Avatar";
  const busy = isUploading || isDeleting;

  const handleFileSelected = async (file: File) => {
    try {
      await upload(file, target);
      toast.success(isAvatar ? t("avatarUpdated") : t("coverUpdated"));
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ProfileMediaValidationError) {
        toast.error(error.reason === "type" ? t("invalidFileType") : t("fileTooLarge"));
      } else {
        toast.error(t("uploadFailed"));
      }
    }
  };

  const handleRemove = async () => {
    try {
      await deleteProfileMedia({ target }).unwrap();
      toast.success(isAvatar ? t("avatarRemoved") : t("coverRemoved"));
      onOpenChange(false);
    } catch {
      toast.error(t("removePhotoFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAvatar ? t("changeAvatar") : t("changeCover")}</DialogTitle>
        </DialogHeader>

        <div className="relative mx-auto flex w-full items-center justify-center py-2">
          {isAvatar ? (
            <Avatar className="size-32">
              <AvatarImage src={imageUrl ?? undefined} alt={userName} />
              <AvatarFallback className="text-3xl">{initials(userName)}</AvatarFallback>
            </Avatar>
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="aspect-video w-full rounded-xl object-cover" />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-subtle bg-surface-elevated text-text-tertiary">
              <ImageOff className="size-6" />
              <span className="text-xs">{t("noPhotoSet")}</span>
            </div>
          )}

          {isUploading && (
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white",
                isAvatar ? "rounded-full" : "rounded-xl"
              )}
            >
              <Loader2 className="size-5 animate-spin" />
              <span className="text-xs font-medium">{progress}%</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleFileSelected(file);
          }}
        />

        <DialogFooter>
          {imageUrl && (
            <Button type="button" variant="destructive" onClick={handleRemove} disabled={busy}>
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              {t("removePhoto")}
            </Button>
          )}
          <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy}>
            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            {t("changePhoto")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
