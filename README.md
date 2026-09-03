# FundFlex Catalog

A full-stack catalog and EMI plan exploration application built with React, Express, and Prisma.

## Tech Stack Used

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query
*   **Backend:** Node.js, Express, TypeScript, Zod (Validation)
*   **Database & ORM:** SQLite (for demo), Prisma ORM
*   **Monorepo Tooling:** npm workspaces, concurrently

## Database Schema and Seed Data

The database schema (`schema.prisma`) defines the entities required for the product catalog, variations, media, and EMI plans.

### Schema Details

*   **Product:** Represents a base product (e.g., iPhone 17 Pro).
*   **Variant:** Represents a specific SKU (e.g., Silver, 256GB).
*   **ProductImage:** Images associated with a variant.
*   **EmiPlan:** Specific EMI financing options available for a variant, including tenure and interest rates.
*   **SelectionIntent:** Represents a user's intent to proceed with a specific variant and EMI plan combination.

*(The full schema definition can be found in `api/prisma/schema.prisma`)*

The `api/prisma/seed.ts` script contains robust seed data for multiple devices, colors, and storage configurations, complete with localized price differences and various EMI tenure plans.

## Setup and Run Instructions

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm

### 1. Install Dependencies
Run the following command in the root directory to install dependencies for both the frontend and backend workspaces:
```bash
npm install
```

### 2. Setup the Database
Initialize the Prisma SQLite database and push the schema:
```bash
npm run db:push -w api
```

### 3. Seed the Database
Populate the database with the sample devices, variants, images, and EMI plans:
```bash
npm run db:seed -w api
```

### 4. Run the Application
Start both the backend API and the frontend development server concurrently:
```bash
npm run dev
```

*   The frontend will be available at: `http://localhost:3000`
*   The backend API will run on: `http://localhost:4000`

---

## API Endpoints and Example Responses

### 1. Get All Products
**Endpoint:** `GET /api/v1/products`
**Description:** Retrieves a list of all active products for the catalog homepage.
**Response:**
```json
{
  "data": [
    {
      "id": "prd_iphone17pro",
      "slug": "iphone-17-pro",
      "brand": "Apple",
      "name": "iPhone 17 Pro",
      "description": "The ultimate iPhone.",
      "variantCount": 4,
      "priceMinor": 11540000,
      "imageUrl": "/iphone17-silver.jpg",
      "defaultVariantId": "var_iphone17_silver_128"
    }
  ],
  "meta": {
    "requestId": "req_...",
    "generatedAt": "2024-03-04T10:00:00Z"
  }
}
```

### 2. Get Product Details (with Variants and EMI Plans)
**Endpoint:** `GET /api/v1/products/:slug`
**Description:** Retrieves full product details, including all variants, images, and pre-calculated EMI plans.
**Response:**
```json
{
  "data": {
    "id": "prd_iphone17pro",
    "slug": "iphone-17-pro",
    "brand": "Apple",
    "name": "iPhone 17 Pro",
    "description": "The ultimate iPhone.",
    "defaultVariantId": "var_iphone17_silver_128",
    "variants": [
      {
        "id": "var_iphone17_silver_128",
        "label": "Silver · 128 GB",
        "sku": "IP17P-SLV-128",
        "color": "Silver",
        "storageGb": 128,
        "mrpMinor": 12490000,
        "priceMinor": 11540000,
        "currency": "INR",
        "stockStatus": "IN_STOCK",
        "images": [
          { "url": "/iphone17-silver.jpg", "alt": "iPhone 17 Pro Silver" }
        ],
        "plans": [
          {
            "id": "plan_ip17_slv_128_3m",
            "tenureMonths": 3,
            "annualInterestBps": 0,
            "cashbackMinor": 750000,
            "monthlyPaymentMinor": 3846667,
            "totalInstalmentsMinor": 11540001,
            "effectiveCostMinor": 10790001,
            "backingLabel": "EMI plan backed by mutual funds",
            "disclosureText": "Illustrative demo terms. Final terms may vary.",
            "badges": []
          }
        ]
      }
    ]
  },
  "meta": { "requestId": "req_...", "generatedAt": "..." }
}
```

### 3. Create Selection Intent
**Endpoint:** `POST /api/v1/selection-intents`
**Description:** Locks in the user's variant and plan selection, revalidating prices on the server, and returns a checkout intent.
**Payload:**
```json
{
  "variantId": "var_iphone17_silver_128",
  "planId": "plan_ip17_slv_128_3m"
}
```
**Response:**
```json
{
  "data": {
    "id": "sel_abc123...",
    "status": "READY_FOR_REVIEW",
    "reviewUrl": "/review/sel_abc123...",
    "expiresAt": "2024-03-04T10:15:00.000Z"
  },
  "meta": { "requestId": "req_...", "generatedAt": "..." }
}
```

### 4. Get Selection Intent Summary
**Endpoint:** `GET /api/v1/selection-intents/:id`
**Description:** Retrieves the summary of a created intent for the review/success page.
**Response:**
```json
{
  "data": {
    "id": "sel_abc123...",
    "status": "READY_FOR_REVIEW",
    "product": {
      "name": "iPhone 17 Pro",
      "brand": "Apple"
    },
    "variant": {
      "label": "Silver · 128 GB",
      "sku": "IP17P-SLV-128",
      "priceMinor": 11540000
    },
    "plan": {
      "tenureMonths": 3,
      "monthlyPaymentMinor": 3846667,
      "annualInterestBps": 0,
      "cashbackMinor": 750000
    }
  },
  "meta": { "requestId": "req_...", "generatedAt": "..." }
}
```
