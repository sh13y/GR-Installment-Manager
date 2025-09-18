# GR Installment Manager 🚗💨

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

![GitHub last commit](https://img.shields.io/github/last-commit/sh13y/GR-Installment-Manager?style=for-the-badge&logo=github)
![GitHub Repo stars](https://img.shields.io/github/stars/sh13y/GR-Installment-Manager?style=for-the-badge&logo=github)

</div>

# Overview

GR Installment Manager is a business management system for installment-based tire sales. It helps track customers, sales, payments, and inventory in a simple, organized way. This project was created for my dad to make his business management easier and more efficient.

# Features

- **User Management**: Role-based access for admins and staff.
- **Customer Registration**: Add and manage customer profiles.
- **Sales Recording**: Log sales transactions with product details.
- **Installment Tracking**: Monitor daily payments and outstanding balances.
- **Inventory Management**: Track stock levels and product information.
- **Dashboard Analytics**: View business metrics, sales, and payment status.
- **PDF Reports**: Generate clear, professional customer statements.

# Technology Stack

- **Frontend**: Next.js (React)
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

# Getting Started

## Prerequisites
- Node.js (v18 or newer)
- npm (comes with Node.js)
- Supabase account

## Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/sh13y/GR-Installment-Manager.git
   cd GR-Installment-Manager
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   - Copy `env.example` to `.env.local`.
   - Add your Supabase project URL and anon key.
4. **Set up the database**
   - Use the SQL files in the `database/` folder to create tables in Supabase.
5. **Start the development server**
   ```bash
   npm run dev
   ```
6. **Open the app**
   - Visit `http://localhost:3000` in your browser.

# Code Structure Explained

- `src/components/` — Contains React components for each feature (customers, sales, payments, dashboard, etc.).
- `src/utils/pdfGenerator.ts` — Generates PDF reports for customers using jsPDF and autotable.
- `src/hooks/` — Custom React hooks (e.g., authentication).
- `src/lib/` — Supabase client setup and helpers.
- `src/types/` — TypeScript type definitions for data models.
- `database/` — SQL files for database schema and sample data.
- `docs/` — Project documentation and guides.

# Example: Generating a Customer PDF Report

The PDF generator takes customer, payment, and sales data and creates a professional statement:

```typescript
import { generateCustomerReport } from './utils/pdfGenerator';

// Usage
await generateCustomerReport(customer, payments, sales);
```
- The function creates a PDF with customer details, summary, purchase history, and payment history.
- Uses jsPDF and jspdf-autotable for layout and formatting.

# Contributing

Pull requests and suggestions are welcome. Please keep code beginner-friendly and well-documented.

# License

MIT

# Author

Built by sh13y for his dad, to make business management easier and more organized.
