"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
import { useGetUsersQuery } from "@/lib/api/users.api";
import { useCreateWorkflowMutation, useUpdateWorkflowMutation } from "@/lib/api/workflows.api";
import type { Workflow } from "@/types/api";
import type {
  ConditionLogicOperator,
  ConditionOperator,
  WorkflowActionType,
  WorkflowTriggerType,
} from "@/types/enums";

const TRIGGER_TYPES: WorkflowTriggerType[] = [
  "RecordCreated",
  "RecordUpdated",
  "RecordStatusChanged",
  "TimeBased",
  "FieldValueMatches",
];
const ACTION_TYPES: WorkflowActionType[] = [
  "SendNotification",
  "SendEmail",
  "SendWhatsAppMessage",
  "CreateTask",
  "UpdateField",
  "AssignOwner",
];
const CONDITION_OPERATORS: ConditionOperator[] = [
  "Equals",
  "NotEquals",
  "GreaterThan",
  "LessThan",
  "Contains",
  "IsEmpty",
  "IsNotEmpty",
];
const LOGIC_OPERATORS: ConditionLogicOperator[] = ["And", "Or"];
const ENTITY_TYPES = ["Contact", "Deal", "Task", "Invoice"];

// The backend stores trigger/action config as an opaque JSON string
// (configJson) and does not validate its shape - these field lists are a
// best-effort, documented convention for what the automation engine likely
// expects, not a verified contract.
type ConfigField = { key: string; labelKey: string; multiline?: boolean; kind?: "text" | "entity" | "user" };

const TRIGGER_CONFIG_FIELDS: Record<WorkflowTriggerType, ConfigField[]> = {
  RecordCreated: [{ key: "entityType", labelKey: "entityType", kind: "entity" }],
  RecordUpdated: [{ key: "entityType", labelKey: "entityType", kind: "entity" }],
  RecordStatusChanged: [{ key: "entityType", labelKey: "entityType", kind: "entity" }],
  TimeBased: [],
  FieldValueMatches: [
    { key: "entityType", labelKey: "entityType", kind: "entity" },
    { key: "field", labelKey: "field" },
    { key: "value", labelKey: "value" },
  ],
};

const ACTION_CONFIG_FIELDS: Record<WorkflowActionType, ConfigField[]> = {
  SendNotification: [
    { key: "title", labelKey: "title" },
    { key: "body", labelKey: "body", multiline: true },
  ],
  SendEmail: [
    { key: "subject", labelKey: "subject" },
    { key: "body", labelKey: "body", multiline: true },
  ],
  SendWhatsAppMessage: [{ key: "message", labelKey: "message", multiline: true }],
  CreateTask: [
    { key: "title", labelKey: "title" },
    { key: "description", labelKey: "description", multiline: true },
  ],
  UpdateField: [
    { key: "field", labelKey: "field" },
    { key: "value", labelKey: "value" },
  ],
  AssignOwner: [{ key: "userId", labelKey: "userId", kind: "user" }],
};

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";
const smallInputClass =
  "w-full rounded-lg border border-border-subtle bg-background px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

type ConditionRow = { field: string; operator: ConditionOperator; value: string };
type ActionRow = { type: WorkflowActionType; config: Record<string, string> };

function parseConfig(json: string | null): Record<string, string> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function ConfigFieldsEditor({
  fields,
  config,
  onChange,
  tField,
}: {
  fields: ConfigField[];
  config: Record<string, string>;
  onChange: (config: Record<string, string>) => void;
  tField: (key: string) => string;
}) {
  const { data: users } = useGetUsersQuery();

  if (fields.length === 0) return null;

  return (
    <div className="space-y-2 rounded-xl border border-border-subtle bg-background/50 p-3">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="text-[11px] font-medium text-text-tertiary uppercase">
            {tField(field.labelKey)}
          </label>
          {field.kind === "entity" ? (
            <Select
              value={config[field.key] || ENTITY_TYPES[0]}
              onValueChange={(value) => onChange({ ...config, [field.key]: value ?? ENTITY_TYPES[0] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.kind === "user" ? (
            <Select
              value={config[field.key] || ""}
              onValueChange={(value) => onChange({ ...config, [field.key]: value ?? "" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => users?.find((u) => u.id === value)?.name ?? ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.multiline ? (
            <textarea
              className={`${smallInputClass} min-h-16 resize-y`}
              value={config[field.key] ?? ""}
              onChange={(e) => onChange({ ...config, [field.key]: e.target.value })}
            />
          ) : (
            <input
              className={smallInputClass}
              value={config[field.key] ?? ""}
              onChange={(e) => onChange({ ...config, [field.key]: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function WorkflowFormSheet({
  open,
  onOpenChange,
  workflow,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: Workflow | null;
}) {
  const t = useTranslations("pages.automation.workflows.form");
  const tTriggerType = useTranslations("pages.automation.workflows.triggerType");
  const tActionType = useTranslations("pages.automation.workflows.actionType");
  const tOperator = useTranslations("pages.automation.workflows.operator");
  const tLogic = useTranslations("pages.automation.workflows.logic");
  const tField = useTranslations("pages.automation.workflows.configField");
  const isEdit = !!workflow;

  const [createWorkflow, { isLoading: isCreating }] = useCreateWorkflowMutation();
  const [updateWorkflow, { isLoading: isUpdating }] = useUpdateWorkflowMutation();
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [triggerType, setTriggerType] = useState<WorkflowTriggerType>("RecordCreated");
  const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});
  const [cronExpression, setCronExpression] = useState("");
  const [logicOperator, setLogicOperator] = useState<ConditionLogicOperator>("And");
  const [conditions, setConditions] = useState<ConditionRow[]>([]);
  const [actions, setActions] = useState<ActionRow[]>([]);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(workflow?.name ?? "");
      setDescription(workflow?.description ?? "");
      setIsActive(workflow?.isActive ?? true);
      setTriggerType(workflow?.trigger.type ?? "RecordCreated");
      setTriggerConfig(parseConfig(workflow?.trigger.configJson ?? null));
      setCronExpression(workflow?.trigger.cronExpression ?? "");
      const firstGroup = workflow?.conditionGroups[0];
      setLogicOperator(firstGroup?.logicOperator ?? "And");
      setConditions(firstGroup?.conditions.map((c) => ({ field: c.field, operator: c.operator, value: c.value })) ?? []);
      setActions(
        (workflow?.actions ?? [])
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((a) => ({ type: a.type, config: parseConfig(a.configJson) }))
      );
    }
  }

  const changeTriggerType = (value: WorkflowTriggerType) => {
    setTriggerType(value);
    setTriggerConfig({});
  };

  const addCondition = () => setConditions((prev) => [...prev, { field: "", operator: "Equals", value: "" }]);
  const updateCondition = (index: number, patch: Partial<ConditionRow>) =>
    setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const removeCondition = (index: number) => setConditions((prev) => prev.filter((_, i) => i !== index));

  const addAction = () => setActions((prev) => [...prev, { type: "SendNotification", config: {} }]);
  const updateAction = (index: number, patch: Partial<ActionRow>) =>
    setActions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  const removeAction = (index: number) => setActions((prev) => prev.filter((_, i) => i !== index));
  const moveAction = (index: number, dir: -1 | 1) =>
    setActions((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const canSubmit = name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = {
      name: name.trim(),
      description: description.trim() || undefined,
      isActive,
      trigger: {
        type: triggerType,
        configJson: Object.keys(triggerConfig).length > 0 ? JSON.stringify(triggerConfig) : undefined,
        cronExpression: triggerType === "TimeBased" ? cronExpression.trim() || undefined : undefined,
      },
      conditionGroups:
        conditions.length > 0
          ? [{ logicOperator, conditions: conditions.filter((c) => c.field.trim()), childGroups: [] }]
          : [],
      actions: actions.map((a, i) => ({
        type: a.type,
        configJson: Object.keys(a.config).length > 0 ? JSON.stringify(a.config) : undefined,
        orderIndex: i,
      })),
    };
    try {
      if (isEdit && workflow) {
        await updateWorkflow({ id: workflow.id, body }).unwrap();
      } else {
        await createWorkflow(body).unwrap();
      }
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
          <div className="space-y-1.5">
            <label htmlFor="wf-name" className="text-xs font-medium text-text-tertiary uppercase">
              {t("name")}
            </label>
            <input id="wf-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="wf-description" className="text-xs font-medium text-text-tertiary uppercase">
              {t("description")}
            </label>
            <textarea
              id="wf-description"
              className={`${inputClass} min-h-16 resize-none`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
            {t("isActive")}
          </label>

          <div className="space-y-2 border-t border-border-subtle pt-4">
            <p className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">{t("triggerSection")}</p>
            <Select value={triggerType} onValueChange={(value) => changeTriggerType(value as WorkflowTriggerType)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => tTriggerType(value as WorkflowTriggerType)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((tt) => (
                  <SelectItem key={tt} value={tt}>
                    {tTriggerType(tt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {triggerType === "TimeBased" ? (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-text-tertiary uppercase">{t("cronExpression")}</label>
                <input
                  className={smallInputClass}
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="0 9 * * 1"
                />
              </div>
            ) : (
              <ConfigFieldsEditor
                fields={TRIGGER_CONFIG_FIELDS[triggerType]}
                config={triggerConfig}
                onChange={setTriggerConfig}
                tField={tField}
              />
            )}
          </div>

          <div className="space-y-2 border-t border-border-subtle pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">
                {t("conditionsSection")}
              </p>
              {conditions.length > 0 && (
                <Select value={logicOperator} onValueChange={(value) => setLogicOperator((value as ConditionLogicOperator) ?? "And")}>
                  <SelectTrigger className="h-7 w-20">
                    <SelectValue>{(value: string) => tLogic(value as ConditionLogicOperator)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LOGIC_OPERATORS.map((op) => (
                      <SelectItem key={op} value={op}>
                        {tLogic(op)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <input
                  className={smallInputClass}
                  placeholder={t("conditionFieldPlaceholder")}
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                />
                <Select
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(index, { operator: (value as ConditionOperator) ?? "Equals" })}
                >
                  <SelectTrigger className="w-36 shrink-0">
                    <SelectValue>{(value: string) => tOperator(value as ConditionOperator)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPERATORS.map((op) => (
                      <SelectItem key={op} value={op}>
                        {tOperator(op)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  className={smallInputClass}
                  placeholder={t("conditionValuePlaceholder")}
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  disabled={condition.operator === "IsEmpty" || condition.operator === "IsNotEmpty"}
                />
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label={t("removeCondition")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addCondition}>
              <Plus className="size-3.5" />
              {t("addCondition")}
            </Button>
          </div>

          <div className="space-y-2 border-t border-border-subtle pt-4">
            <p className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">{t("actionsSection")}</p>
            {actions.map((action, index) => (
              <div key={index} className="space-y-2 rounded-xl border border-border-subtle p-3">
                <div className="flex items-center gap-1.5">
                  <Select
                    value={action.type}
                    onValueChange={(value) => updateAction(index, { type: (value as WorkflowActionType) ?? "SendNotification", config: {} })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{(value: string) => tActionType(value as WorkflowActionType)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((at) => (
                        <SelectItem key={at} value={at}>
                          {tActionType(at)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => moveAction(index, -1)}
                    disabled={index === 0}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary disabled:opacity-30"
                    aria-label={t("moveUp")}
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveAction(index, 1)}
                    disabled={index === actions.length - 1}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary disabled:opacity-30"
                    aria-label={t("moveDown")}
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label={t("removeAction")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <ConfigFieldsEditor
                  fields={ACTION_CONFIG_FIELDS[action.type]}
                  config={action.config}
                  onChange={(config) => updateAction(index, { config })}
                  tField={tField}
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addAction}>
              <Plus className="size-3.5" />
              {t("addAction")}
            </Button>
          </div>
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
