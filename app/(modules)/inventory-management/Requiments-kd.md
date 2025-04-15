# 📦 Inventory Management Module

**Module Type:** Add-on to Core SaaS App  
**Target Users:** Business Owners managing products and stock

---

## 📌 Overview

The Inventory Module helps businesses manage stock in real time, with clear tracking of purchases and sales, product pricing, profitability, and tax. It integrates seamlessly with the Payment Module to deduct stock automatically when invoices are created.

---

## ✅ Objectives

- Track purchase and sale of products.
- Maintain batch-wise stock entries.
- Support GST/tax computation.
- Calculate real-time stock and profitability.
- Enable low-stock alerts and inventory reports.

---

## 🧱 Required Pages/Screens

| Page Name              | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| Inventory Dashboard    | Stock summary, profitability trends, low stock alerts                   |
| Product List           | View/search/sort product catalog with quick action buttons              |
| Add/Edit Product       | Add/edit product details including SKU, pricing, tax                    |
| Stock In Entry         | Enter new batch of products received from vendors                       |
| Stock Out Entry (Auto) | Auto-linked with invoice generation, manages batch-wise stock deduction |
| Product Detail         | Complete analytics and price/stock movement per product                 |
| Reports Page           | Exportable reports for stock value, GST, profit/loss                    |

---

## 🔄 Integration with Invoice (Payment Module)

- When a user generates an invoice:
  - Stock is deducted using FIFO method.
  - Profit is calculated using the purchase price from the stock batch.
  - Invoice line items will include productId, quantity, rate, tax, and profit.
- Stock deduction logic:
  - On invoice submit, a webhook or internal event triggers stock deduction.
  - The system fetches required product data and available stock batches.
  - Deduction occurs from oldest stock batch first (FIFO).
- Profit data and tax breakdown can be shown on the invoice preview.
- A flag in the user’s subscription plan will control whether inventory features are enabled during invoice creation.

> ❗ If the Inventory Module is **not purchased**, invoice generation won’t deduct stock or calculate profit.

---

## 🧾 Widgets for Dashboard

| Widget Name             | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| Stock Summary           | Overview of total stock value, items in stock, and items out of stock |
| Profitability Snapshot  | Shows profit margins across recent sales                              |
| Low Stock Alerts        | Highlights products that are below reorder threshold                  |
| Top Selling Products    | Displays products with highest turnover in selected time range        |
| Recent Stock In Entries | Lists latest stock additions with quantity and vendor info            |
| Inventory Value Chart   | Visual chart of inventory value trends over time                      |
| Tax Collected (GST)     | Overview of total tax collected through product sales                 |

---

## 🦾 Product JSON Structure

```json
{
  "productId": "prod-123",
  "name": "Product A",
  "sku": "SKU001",
  "unit": "pcs",
  "defaultPurchasePrice": 50,
  "salePrice": 80,
  "taxRate": 18,
  "taxType": "exclusive",
  "createdAt": "2025-04-15"
}
```

---

## 📦 Stock Entry JSON (Batch-wise)

```json
{
  "entryId": "entry-001",
  "productId": "prod-123",
  "quantity": 100,
  "purchasePrice": 48,
  "vendor": "Vendor A",
  "entryDate": "2025-04-10"
}
```

---

## 📤 Stock Out JSON (Linked with Invoice)

```json
{
  "outId": "out-001",
  "invoiceId": "inv-456",
  "productId": "prod-123",
  "quantity": 60,
  "batchesUsed": [
    { "entryId": "entry-001", "quantity": 50, "purchasePrice": 48 },
    { "entryId": "entry-002", "quantity": 10, "purchasePrice": 49 }
  ],
  "date": "2025-04-15"
}
```

---

## 🦾 Invoice Creation JSON (with Inventory Integration)

```json
{
  "invoiceId": "inv-456",
  "retailerId": "ret-101",
  "invoiceDate": "2025-04-15",
  "dueDate": "2025-04-22",
  "items": [
    {
      "productId": "prod-123",
      "description": "Product A",
      "quantity": 60,
      "unitPrice": 80,
      "taxRate": 18,
      "taxType": "exclusive",
      "total": 5664,
      "batchesUsed": [
        { "entryId": "entry-001", "quantity": 50, "purchasePrice": 48 },
        { "entryId": "entry-002", "quantity": 10, "purchasePrice": 49 }
      ]
    }
  ],
  "subTotal": 4800,
  "taxAmount": 864,
  "totalAmount": 5664,
  "profit": 1320
}
```

---

## 📈 Profit Calculation Logic

- **Invoice Profit = Total Sale - Total Cost**
- **Cost = Sum of (Qty × PurchasePrice from batch)**
- Profit shown per product and overall invoice

---

## 💰 Tax/GST Handling

- Each product can be configured with:
  - `taxRate` (e.g. 5%, 12%, 18%)
  - `taxType`: inclusive / exclusive
- Tax amount will be auto-calculated in invoice and shown in reports

---

## 📊 Reports

- Inventory Value by Date
- Profit and Loss per month
- Stock Movement Ledger
- GST Summary
- Low Stock Alerts

---

## 🔮 Future Scope

- Expiry tracking (for perishable goods)
- Barcoding integration
- Vendor-wise product tracking
- Multi-location inventory
- Auto reorder suggestions

---
