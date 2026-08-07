"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ContractStatus } from "@/types/enums";

const ALL = "__all__";
const STATUSES: ContractStatus[] = ["Draft", "Sent", "Signed", "Expired", "Cancelled"];

export function ContractsFilters({
  status,
  onStatusChange,
  onCreate,
}: {
  status: string;
  onStatusChange: (value: string) => void;
  onCreate: () => void;
}) {
  const t = useTranslations("pages.contracts");
  const tStatus = useTranslations("enums.contractStatus");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={status || ALL}
        onValueChange={(value) => onStatusChange(value === ALL || !value ? "" : value)}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue>
            {(value: string) =>
              !value || value === ALL ? t("allStatuses") : tStatus(value as ContractStatus)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allStatuses")}</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {tStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" onClick={onCreate} className="ml-auto">
        {t("createContract")}
      </Button>
    </div>
  );
}
