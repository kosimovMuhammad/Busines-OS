"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCreateTemplateMutation, useUpdateTemplateMutation } from "@/lib/api/templates.api";
import type { Template } from "@/types/api";
import type { TemplateType } from "@/types/enums";

const TYPES: TemplateType[] = ["Contract", "Email", "Other"];

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function TemplateFormSheet({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}) {
  const t = useTranslations("pages.contracts.templates.form");
  const tType = useTranslations("enums.templateType");
  const isEdit = !!template;

  const [createTemplate, { isLoading: isCreating }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [type, setType] = useState<TemplateType>("Contract");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(template?.name ?? "");
      setType(template?.type ?? "Contract");
      setContent(template?.content ?? "");
      setIsActive(template?.isActive ?? true);
    }
  }

  const canSubmit = name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = { name: name.trim(), type, content: content || undefined, isActive };
    try {
      if (isEdit && template) {
        await updateTemplate({ id: template.id, body }).unwrap();
      } else {
        await createTemplate(body).unwrap();
      }
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-1.5">
            <label htmlFor="template-name" className="text-xs font-medium text-text-tertiary uppercase">
              {t("name")}
            </label>
            <input id="template-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="template-type" className="text-xs font-medium text-text-tertiary uppercase">
              {t("type")}
            </label>
            <Select value={type} onValueChange={(value) => setType(value as TemplateType)}>
              <SelectTrigger id="template-type" className="w-full">
                <SelectValue>{(value: string) => tType(value as TemplateType)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((tt) => (
                  <SelectItem key={tt} value={tt}>
                    {tType(tt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="template-content" className="text-xs font-medium text-text-tertiary uppercase">
              {t("content")}
            </label>
            <textarea
              id="template-content"
              className={`${inputClass} min-h-40 resize-y font-mono text-xs`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("contentPlaceholder")}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
            {t("isActive")}
          </label>
        </div>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
