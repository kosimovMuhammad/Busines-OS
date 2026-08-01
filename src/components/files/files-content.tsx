"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetFilesQuery } from "@/lib/api/files.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileList } from "./file-list";
import { FileUploaderSheet } from "./file-uploader-sheet";

const ALL = "__all__";

export function FilesContent() {
  const t = useTranslations("pages.files");
  const [contactId, setContactId] = useState("");
  const [uploaderOpen, setUploaderOpen] = useState(false);

  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: files, isLoading } = useGetFilesQuery({
    contactId: contactId || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={contactId || ALL}
          onValueChange={(value) => setContactId(value === ALL || !value ? "" : value)}
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue>
              {(value: string) =>
                !value || value === ALL
                  ? t("allContacts")
                  : (() => {
                      const c = contactsPage?.data.find((x) => x.id === value);
                      return c
                        ? [c.firstName, c.lastName].filter(Boolean).join(" ")
                        : t("allContacts");
                    })()
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allContacts")}</SelectItem>
            {contactsPage?.data.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {[c.firstName, c.lastName].filter(Boolean).join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" onClick={() => setUploaderOpen(true)} className="ml-auto">
          {t("uploadFile")}
        </Button>
      </div>

      <FileList files={files ?? []} isLoading={isLoading} />

      <FileUploaderSheet
        open={uploaderOpen}
        onOpenChange={setUploaderOpen}
        defaultContactId={contactId || undefined}
      />
    </div>
  );
}
