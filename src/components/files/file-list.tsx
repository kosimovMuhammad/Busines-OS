"use client";

import { useLocale, useTranslations } from "next-intl";
import { File as FileIcon, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useRemoveFileMutation } from "@/lib/api/files.api";
import type { FileAsset } from "@/types/api";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileList({
  files,
  isLoading,
}: {
  files: FileAsset[];
  isLoading: boolean;
}) {
  const t = useTranslations("pages.files");
  const locale = useLocale();
  const [removeFile] = useRemoveFileMutation();

  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return <EmptyState icon={FileIcon} title={t("empty")} />;
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
            <FileIcon className="size-4" />
          </div>
          <a
            href={file.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1"
          >
            <p className="truncate text-sm font-medium text-text-primary hover:underline">
              {file.filename}
            </p>
            <p className="text-xs text-text-tertiary">
              {formatSize(file.sizeBytes)} · {formatter.format(new Date(file.createdAt))}
            </p>
          </a>
          <button
            type="button"
            onClick={() => removeFile(file.id)}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label={t("delete")}
          >
            <Trash2 className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
