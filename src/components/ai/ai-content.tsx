"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiQueryPanel } from "./ai-query-panel";
import { AiDraftEmailPanel } from "./ai-draft-email-panel";
import { AiQuotationPanel } from "./ai-quotation-panel";
import { AiForecastPanel } from "./ai-forecast-panel";
import { AiAssistantPanel } from "./ai-assistant-panel";

export function AiContent() {
  const t = useTranslations("pages.ai.tabs");

  return (
    <Tabs defaultValue="query">
      <TabsList>
        <TabsTrigger value="query">{t("query")}</TabsTrigger>
        <TabsTrigger value="draftEmail">{t("draftEmail")}</TabsTrigger>
        <TabsTrigger value="quotation">{t("quotation")}</TabsTrigger>
        <TabsTrigger value="forecast">{t("forecast")}</TabsTrigger>
        <TabsTrigger value="assistant">{t("assistant")}</TabsTrigger>
      </TabsList>

      <TabsContent value="query" className="mt-4">
        <AiQueryPanel />
      </TabsContent>
      <TabsContent value="draftEmail" className="mt-4">
        <AiDraftEmailPanel />
      </TabsContent>
      <TabsContent value="quotation" className="mt-4">
        <AiQuotationPanel />
      </TabsContent>
      <TabsContent value="forecast" className="mt-4">
        <AiForecastPanel />
      </TabsContent>
      <TabsContent value="assistant" className="mt-4">
        <AiAssistantPanel />
      </TabsContent>
    </Tabs>
  );
}
