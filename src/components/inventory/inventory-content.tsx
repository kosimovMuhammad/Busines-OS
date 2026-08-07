"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireRole } from "@/components/shared/require-role";
import { ProductsTab } from "./products-tab";
import { CategoriesTab } from "./categories-tab";
import { SuppliersTab } from "./suppliers-tab";
import { PurchaseOrdersTab } from "./purchase-orders-tab";
import { StockTab } from "./stock-tab";
import { ExpensesTab } from "./expenses-tab";

function InventoryInner() {
  const t = useTranslations("pages.inventory.tabs");

  return (
    <Tabs defaultValue="products">
      <TabsList>
        <TabsTrigger value="products">{t("products")}</TabsTrigger>
        <TabsTrigger value="categories">{t("categories")}</TabsTrigger>
        <TabsTrigger value="suppliers">{t("suppliers")}</TabsTrigger>
        <TabsTrigger value="purchaseOrders">{t("purchaseOrders")}</TabsTrigger>
        <TabsTrigger value="stock">{t("stock")}</TabsTrigger>
        <TabsTrigger value="expenses">{t("expenses")}</TabsTrigger>
      </TabsList>

      <TabsContent value="products" className="mt-4">
        <ProductsTab />
      </TabsContent>
      <TabsContent value="categories" className="mt-4">
        <CategoriesTab />
      </TabsContent>
      <TabsContent value="suppliers" className="mt-4">
        <SuppliersTab />
      </TabsContent>
      <TabsContent value="purchaseOrders" className="mt-4">
        <PurchaseOrdersTab />
      </TabsContent>
      <TabsContent value="stock" className="mt-4">
        <StockTab />
      </TabsContent>
      <TabsContent value="expenses" className="mt-4">
        <ExpensesTab />
      </TabsContent>
    </Tabs>
  );
}

export function InventoryContent() {
  return (
    <RequireRole roles={["Owner", "Admin", "Manager", "Sales", "ReadOnly"]}>
      <InventoryInner />
    </RequireRole>
  );
}
