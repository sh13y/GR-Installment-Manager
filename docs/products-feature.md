# Products Management Feature

## Overview
A comprehensive products management system has been added to allow flexible pricing and product configuration for the installment management system.

## Features

### 1. Product Management
- **Add Products**: Create new products with custom pricing and installment settings
- **Edit Products**: Modify existing products (cost price, selling price, service charge, etc.)
- **Delete Products**: Remove products (with validation to prevent deletion if used in sales)
- **Activate/Deactivate**: Toggle product status without deleting

### 2. Pricing Configuration
- **Cost Price**: The purchase/cost price of the product
- **Selling Price**: The sale price to customers  
- **Profit Calculation**: Automatically calculated (Selling Price - Cost Price)
- **Service Charge**: Additional service fee
- **Total Customer Payment**: Selling Price + Service Charge

### 3. Installment Settings
- **Daily Installment**: Amount customer pays per installment
- **Max Installments**: Maximum number of installments allowed
- **Validation**: Ensures installments × daily amount covers total payment

### 4. User Interface
- **Products Table**: Sortable, searchable table with status filtering
- **Product Form**: Comprehensive form with real-time calculations
- **Modal Interface**: Clean popup forms for adding/editing
- **Visual Indicators**: Color-coded profit margins and status badges

## Database Structure

### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    service_charge DECIMAL(10,2) NOT NULL,
    daily_installment DECIMAL(10,2) NOT NULL,
    max_installments INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Default Products
- **FM Tyre**: Based on current business constants
- **Premium Motorcycle Tyre**: Higher-end option
- **Standard Motorcycle Tyre**: Budget option  
- **Heavy Duty Motorcycle Tyre**: Premium heavy-duty option

## Integration

### Sales System
- Sales form now uses products from database instead of hardcoded values
- Automatic price calculations based on selected product
- Quantity support with per-unit pricing

### Navigation
- New "Products" tab in sidebar (admin only)
- Accessible only to super_admin users
- Clean, intuitive navigation flow

### Security
- Row Level Security (RLS) policies implemented
- Admin-only access for product management
- All users can view products for sales

## Usage Instructions

### For Administrators:
1. Navigate to "Products" in the sidebar
2. Click "Add Product" to create new products
3. Fill in pricing and installment details
4. Save and product becomes available in sales

### For Sales Staff:
1. When creating sales, select from available products
2. Product pricing is automatically applied
3. Installment terms are pre-configured

## Benefits

1. **Flexibility**: Easy to add new products and adjust pricing
2. **Scalability**: No longer limited to single tire type
3. **Business Growth**: Support for multiple product lines
4. **Accurate Calculations**: Real-time profit and payment calculations
5. **Future-Proof**: Ready for any type of installment business

## Files Added/Modified

### New Files:
- `/src/app/products/page.tsx`
- `/src/components/products/ProductsContent.tsx`
- `/src/components/products/ProductForm.tsx`
- `/src/components/products/ProductsTable.tsx`
- `/database/products-migration.sql`

### Modified Files:
- `/src/utils/constants.ts` - Added PRODUCTS navigation
- `/src/components/layout/Sidebar.tsx` - Added CubeIcon and Products link
- `/src/types/index.ts` - Added ProductForm type

## Next Steps

To activate the products feature:

1. **Run the migration**:
   ```sql
   -- Execute /database/products-migration.sql in Supabase
   ```

2. **Verify products are created**:
   - Login as admin
   - Navigate to Products page
   - Should see 4 default products

3. **Test sales integration**:
   - Create a new sale
   - Select different products
   - Verify pricing calculations

The system is now ready to handle multiple products with flexible pricing and installment configurations!
