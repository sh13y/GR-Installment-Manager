# GR Installment Manager

A comprehensive web-based installment management system designed for businesses that sell products through installment plans. While originally developed for tire sales, this flexible system can accommodate any product-based installment business model.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Code Structure](#code-structure)
- [Business Logic](#business-logic)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

The GR Installment Manager is a full-stack business management application that streamlines the process of selling products through installment plans. It handles everything from customer registration and sales creation to daily payment collection and comprehensive reporting.

### Why This System?

Managing installment-based sales manually is like trying to juggle while riding a unicycle - possible, but unnecessarily complicated and prone to spectacular failures. This system automates the complex calculations, tracks payments meticulously, and provides insights that help grow your business.

### Core Business Model

The system is built around a flexible installment model:
- **Registration Fee**: One-time customer onboarding fee
- **Initial Payment**: Down payment at the time of sale
- **Daily Installments**: Regular payments until the balance is cleared
- **Service Charges**: Additional fees for the installment service
- **Product Flexibility**: Any product can be configured with custom pricing

## Features

### Customer Management
- **Registration System**: Comprehensive customer onboarding with NIC validation
- **Profile Management**: Complete customer information with contact details
- **Payment History**: Track registration fees and payment patterns
- **Status Tracking**: Active, inactive, and payment status monitoring

### Sales Management
- **Flexible Product Configuration**: Add any product with custom pricing
- **Automated Calculations**: System handles all financial computations
- **Sale Numbers**: Unique identifiers for easy tracking (Format: S-YYYYMMDD-NNNN)
- **Status Tracking**: Active, completed, and defaulted sales
- **Quantity Support**: Handle multiple units in a single sale

### Payment Processing
- **Daily Payment Collection**: Streamlined payment entry interface
- **Multiple Payment Methods**: Cash, bank transfer, cheque support
- **Automatic Balance Updates**: Real-time remaining balance calculations
- **Payment History**: Complete audit trail for all transactions
- **Overpayment Handling**: Flexible payment amounts above minimum daily rates

### User Management & Security
- **Role-Based Access Control**: Super Admin and Data Entry Staff roles
- **Secure Authentication**: Protected routes and API endpoints
- **Data Validation**: Comprehensive input validation and error handling
- **Audit Trails**: Track all user actions and data modifications

### Reporting & Analytics
- **Dashboard Overview**: Key performance indicators and business metrics
- **Financial Reports**: Revenue, outstanding balances, and profit analysis
- **Customer Analytics**: Registration trends and payment behavior
- **Sales Performance**: Daily, weekly, and monthly sales tracking
- **Export Capabilities**: Generate reports for external analysis

### Advanced Features
- **Edit/Delete Capabilities**: Modify sales and payments with proper authorization
- **Search & Filter**: Advanced filtering across all data entities
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Automatic data refresh without page reloads
- **Error Recovery**: Graceful error handling with user-friendly messages

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router for modern web development
- **TypeScript**: Type-safe development with enhanced IDE support
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Heroicons**: Beautiful SVG icons for consistent UI elements
- **React Hot Toast**: Elegant notification system for user feedback

### Backend
- **Supabase**: Backend-as-a-Service providing database, authentication, and APIs
- **PostgreSQL**: Robust relational database with advanced features
- **Row Level Security (RLS)**: Database-level security policies
- **Real-time Subscriptions**: Live data updates across clients

### Development Tools
- **ESLint**: Code linting for consistent code quality
- **Prettier**: Code formatting for maintainable codebase
- **Git**: Version control with comprehensive commit history

## Prerequisites

Before installing the system, ensure you have:

- **Node.js**: Version 18.0 or higher
- **npm or yarn**: Package manager for dependency installation
- **Supabase Account**: For backend services (free tier available)
- **Git**: For version control and deployment
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fm-tire-management.git
cd fm-tire-management
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Additional configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Database Setup

### 1. Create Supabase Project

1. Visit [Supabase](https://supabase.com) and create a new project
2. Note your project URL and anon key from the project settings
3. Navigate to the SQL Editor in your Supabase dashboard

### 2. Initialize Database Schema

Execute the complete schema script located in `database/schema.sql`:

```sql
-- Run the entire contents of database/schema.sql in Supabase SQL Editor
-- This creates all tables, functions, triggers, and security policies
```

### 3. Apply Migrations

If you're upgrading from an existing installation, apply any pending migrations:

```sql
-- Run migration scripts in order from database/migrations/
-- Example: add_sale_number.sql for sale number functionality
```

### 4. Seed Initial Data

```sql
-- Create default admin user (run once)
-- Replace with your actual credentials
INSERT INTO users (email, password_hash, role, full_name, nic_number, phone)
VALUES (
  'admin@yourdomain.com',
  '$2a$10$...',  -- Use proper bcrypt hash
  'super_admin',
  'System Administrator',
  '123456789V',
  '+1234567890'
);

-- Create default product
INSERT INTO products (name, cost_price, selling_price, service_charge, daily_installment, max_installments)
VALUES (
  'Default Product',
  5110.00,
  5610.00,
  700.00,
  57.00,
  100
);
```

## Configuration

### Business Constants

Modify business rules in `src/utils/constants.ts`:

```typescript
export const BUSINESS_CONSTANTS = {
  REGISTRATION_FEE: 250.00,
  DAILY_INSTALLMENT: 57.00,
  SERVICE_CHARGE: 700.00,
  COMPANY_NAME: "Your Company Name",
  APP_NAME: "Your App Name"
}
```

### Payment Methods

Configure available payment methods:

```typescript
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque'
}
```

## Usage Guide

### First-Time Setup

1. **Access the System**: Navigate to your application URL
2. **Login**: Use your admin credentials to access the dashboard
3. **Create Products**: Add your products with pricing information
4. **User Management**: Create staff accounts with appropriate roles

### Daily Operations

#### Customer Registration
1. Navigate to Customers → New Customer
2. Fill in customer details with NIC verification
3. Collect and record registration fee payment
4. Verify customer information before saving

#### Creating Sales
1. Go to Sales → New Sale
2. Select registered customer (registration fee must be paid)
3. Choose product and quantity
4. Enter initial payment amount
5. System calculates remaining balance automatically
6. Review and confirm sale details

#### Recording Payments
1. Navigate to Payments → Record Payment
2. Select customer sale from dropdown (shows sale number and balance)
3. Enter payment amount (minimum daily installment)
4. Choose payment method and add notes if needed
5. System updates remaining balance automatically

#### Managing Data
- **Search**: Use the search functionality to find customers, sales, or payments
- **Filter**: Apply date and status filters for focused views
- **Edit**: Modify existing records (role-dependent permissions)
- **Delete**: Remove records with super admin authorization

## API Documentation

### Authentication

All API endpoints require authentication. Include the Supabase session token in requests:

```javascript
const { data, error } = await supabase.auth.getSession()
// Use data.session.access_token for API calls
```

### Core Endpoints

#### Customers
```javascript
// Get all customers
const { data } = await supabase.from('customers').select('*')

// Create customer
const { data } = await supabase.from('customers').insert({
  full_name: 'John Doe',
  nic_number: '123456789V',
  phone: '+1234567890',
  registration_fee_paid: true
})
```

#### Sales
```javascript
// Get sales with related data
const { data } = await supabase
  .from('sales')
  .select(`
    *,
    customer:customers!customer_id(*),
    product:products!product_id(*)
  `)
```

#### Payments
```javascript
// Record payment
const { data } = await supabase.from('payments').insert({
  sale_id: 'uuid',
  amount: 57.00,
  payment_method: 'cash',
  payment_date: '2025-09-06'
})
```

## Code Structure

### Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── layout.tsx         # Root layout with metadata
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── customers/        # Customer management
│   ├── sales/            # Sales management
│   ├── payments/         # Payment processing
│   ├── layout/           # Layout components
│   ├── providers/        # Context providers
│   └── ui/               # Generic UI components
├── hooks/                # Custom React hooks
├── lib/                  # Third-party library configurations
├── types/               # TypeScript type definitions
└── utils/               # Utility functions and constants
```

### Key Components Explained

#### DataProvider (`src/components/providers/DataProvider.tsx`)
This is the heart of the application's state management. It provides a centralized data cache that:

```typescript
// Manages global state for all entities
const DataContext = createContext<{
  customers: Customer[]
  sales: Sale[]
  payments: Payment[]
  invalidateData: (entity?: string) => void
}>()

// Automatic data fetching and caching
useEffect(() => {
  fetchCustomers()
  fetchSales()
  fetchPayments()
}, [])
```

The provider implements smart caching to minimize database queries and provides real-time updates across components.

#### Form Components Pattern
All form components follow a consistent pattern:

```typescript
interface FormProps {
  editingItem?: Item | null
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

// Pre-fill form when editing
useEffect(() => {
  if (editingItem) {
    setFormData({
      field1: editingItem.field1,
      field2: editingItem.field2
    })
  }
}, [editingItem])
```

#### Table Components Architecture
Table components are designed for reusability and performance:

```typescript
interface TableProps {
  items: Item[]
  loading: boolean
  onEdit?: (item: Item) => void
  onDelete?: (itemId: string) => void
  userRole?: string
}

// Role-based action visibility
{userRole === 'super_admin' && (
  <button onClick={() => onDelete(item.id)}>
    Delete
  </button>
)}
```

## Business Logic

### Financial Calculations

The system handles complex financial calculations automatically:

```typescript
// Sale total calculation
const totalAmount = (product.selling_price * quantity) + product.service_charge

// Remaining balance after initial payment
const remainingBalance = totalAmount - initialPayment

// Payment processing
const newBalance = Math.max(0, currentBalance - paymentAmount)
const newStatus = newBalance === 0 ? 'completed' : 'active'
```

### Sale Number Generation

Unique sale numbers are generated using database functions:

```sql
-- Format: S-YYYYMMDD-NNNN (e.g., S-20250906-0001)
CREATE FUNCTION generate_sale_number() RETURNS TEXT AS $$
DECLARE
    today_date TEXT;
    next_number INTEGER;
BEGIN
    today_date := to_char(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(substring(sale_number from 13 for 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales 
    WHERE sale_number LIKE 'S-' || today_date || '-%';
    
    RETURN 'S-' || today_date || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

### Data Validation

Comprehensive validation ensures data integrity:

```typescript
const validateCustomer = (data: CustomerForm): ValidationErrors => {
  const errors: ValidationErrors = {}
  
  if (!data.nic_number || !isValidNIC(data.nic_number)) {
    errors.nic_number = 'Valid NIC number is required'
  }
  
  if (!data.phone || !isValidPhone(data.phone)) {
    errors.phone = 'Valid phone number is required'
  }
  
  return errors
}
```

## Development

### Getting Started with Development

1. **Fork the Repository**: Create your own copy for development
2. **Create Feature Branch**: Use descriptive branch names
3. **Follow Code Standards**: ESLint and Prettier configurations are provided
4. **Write Tests**: Add tests for new functionality (testing framework to be implemented)
5. **Update Documentation**: Keep README and inline comments current

### Code Style Guidelines

- **TypeScript**: Use strict type checking
- **Components**: Prefer functional components with hooks
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Explain complex business logic and calculations
- **Error Handling**: Implement comprehensive error boundaries

### Adding New Features

1. **Plan the Feature**: Document requirements and business logic
2. **Create Types**: Define TypeScript interfaces for new data structures
3. **Database Changes**: Create migration scripts for schema modifications
4. **API Integration**: Update data providers and API calls
5. **UI Implementation**: Create reusable components following established patterns

## Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

#### Other Platforms
- **Netlify**: Static site deployment with serverless functions
- **Railway**: Full-stack deployment with database hosting
- **DigitalOcean**: VPS deployment with custom server configuration

### Database Backup

Regular backups are crucial for production systems:

```bash
# Create backup using Supabase CLI
supabase db dump --db-url "postgresql://..." > backup.sql

# Restore from backup
supabase db reset --db-url "postgresql://..." --backup-file backup.sql
```

## Contributing

We welcome contributions! Please follow these guidelines:

### Pull Request Process

1. **Issue First**: Create an issue describing the problem or feature
2. **Branch Naming**: Use format `feature/description` or `fix/description`
3. **Commit Messages**: Write clear, descriptive commit messages
4. **Testing**: Ensure all existing functionality remains intact
5. **Documentation**: Update relevant documentation for changes

### Coding Standards

- Follow existing code patterns and naming conventions
- Use TypeScript for all new code
- Implement proper error handling
- Add comments for complex business logic
- Ensure responsive design for UI changes

## Security

### Data Protection
- All sensitive data is encrypted in transit and at rest
- Row Level Security (RLS) policies protect data access
- User authentication uses secure token-based system
- Input validation prevents SQL injection and XSS attacks

### User Access Control
- Role-based permissions control feature access
- Super Admin: Full system access including deletions
- Data Entry Staff: Limited to daily operations
- Audit trails track all user actions

### Best Practices
- Regular security updates for dependencies
- Environment variables for sensitive configuration
- HTTPS enforcement in production
- Regular backup and recovery testing

## Troubleshooting

### Common Issues

#### Database Connection Problems
```bash
# Check Supabase connection
Error: Failed to connect to database
Solution: Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Authentication Issues
```bash
# User cannot login
Error: Invalid login credentials
Solution: Check user exists in users table and password is correct
```

#### Build Failures
```bash
# TypeScript compilation errors
Error: Type 'X' is not assignable to type 'Y'
Solution: Check type definitions in src/types/index.ts
```

#### Performance Issues
- **Slow queries**: Check database indexes and query optimization
- **Large data sets**: Implement pagination for tables with many records
- **Memory usage**: Monitor component re-renders and optimize React hooks

### Getting Help

1. **Check the logs**: Browser console and server logs provide detailed error information
2. **Review documentation**: Most issues are covered in this README
3. **Community support**: Create issues in the GitHub repository
4. **Professional support**: Contact the development team for custom modifications

## Future Enhancements

### Planned Features
- **Mobile App**: React Native application for field operations
- **Advanced Reporting**: PDF generation and email delivery
- **Integration APIs**: Connect with accounting software
- **Multi-tenant Support**: Serve multiple businesses from single installation
- **Advanced Analytics**: Machine learning for payment prediction

### Customization Options
- **Product Categories**: Group products by type or brand
- **Custom Fields**: Add business-specific data fields
- **Workflow Automation**: Automated notifications and follow-ups
- **Multi-language Support**: Localization for different languages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with modern web technologies for reliability and performance
- Designed with small business owners in mind
- Inspired by real-world installment business challenges

**Remember**: This system can handle any product-based installment business, not just tires. The flexible architecture adapts to your specific business needs while maintaining the robust financial tracking that makes installment sales manageable and profitable.

For questions, suggestions, or custom development needs, please don't hesitate to reach out. Happy selling!

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
