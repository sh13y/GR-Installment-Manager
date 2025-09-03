# FM Tire Management System

A comprehensive business management system for installment-based tire sales business.

## Business Model

### Product: FM Tyre
- **Cost Price**: ₹5,110 per tire
- **Selling Price**: ₹5,610 (₹500 profit margin)
- **Customer Payment Structure**: 
  - Initial Payment: ₹610
  - Remaining Balance: ₹5,000 + Service Charge ₹700 = ₹5,700
  - Daily Installment: ₹57 × 100 installments (max)
  - Customers can pay more than ₹57 daily to finish faster

### Registration
- **New Customer Fee**: ₹250 (one-time registration)
- **Customer ID**: NIC Number (unique identifier)

## System Features

### 1. User Management
- Super Admin (Business Owner)
- Data Entry Staff (Limited Permissions)
- Secure login with role-based access

### 2. Core Modules
- Customer Registration & Profile Management
- Sales Transaction Recording
- Daily Installment Payment Tracking
- Payment History & Outstanding Balance
- Inventory Management

### 3. Analytics Dashboard
- Business Growth Charts
- Profit/Loss Analysis
- Sales Overview
- Payment Collection Status
- Predictive Analytics
- Customer Payment Behavior

### 4. Technical Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Chart.js/Recharts
- **Deployment**: Vercel/Netlify

## Project Structure
```
fm-tire-management/
├── frontend/          # React application
├── backend/          # Node.js API (if needed)
├── database/         # Supabase schema and migrations
├── docs/            # Documentation
└── deployment/      # Deployment configurations
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Setup Supabase database
5. Run development server: `npm run dev`

## Security Features
- Role-based access control
- Secure password hashing
- Data encryption
- Audit trails
- Input validation

## Maintenance
- Regular backups
- Performance monitoring
- Security updates
- Feature enhancements based on business needs
