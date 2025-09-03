# FM Tire Management System - Business Requirements

## Business Model Overview

### Product Details
- **Product**: FM Tyre (Three-wheel tires)
- **Cost Price**: ₹5,110 per tire
- **Selling Price**: ₹5,610 per tire
- **Profit Margin**: ₹500 per tire

### Customer Payment Structure

#### Registration Process
- **New Customer Fee**: ₹250 (one-time, lifetime registration)
- **Customer Identification**: NIC Number (unique identifier)

#### Purchase Flow
1. **Initial Payment**: ₹610 from customer
2. **Business Investment**: ₹5,000 (to complete ₹5,610 tire purchase)
3. **Customer Owes**: ₹5,000 + ₹700 service charge = ₹5,700
4. **Installment Plan**: ₹57 per day × 100 installments maximum
5. **Early Payment**: Customers can pay more than ₹57 daily to finish faster

### Business Calculations

```
Tire Cost to Business: ₹5,110
Selling Price: ₹5,610
Profit per Tire: ₹500

Customer Payment Breakdown:
- Initial Payment: ₹610
- Remaining Balance: ₹5,000
- Service Charge: ₹700
- Total Customer Payment: ₹5,700

Daily Installment: ₹57
Maximum Installments: 100 days
Early Payment: Allowed (>₹57/day)
```

## System Requirements

### 1. User Management
- **Super Admin**: Business owner with full access
- **Data Entry Staff**: Limited permissions for daily operations
- **Authentication**: Secure login with role-based access control
- **User Identification**: NIC numbers for unique user identification

### 2. Customer Management
- **Registration**: New customer onboarding with ₹250 fee
- **Profile Management**: Personal information, contact details
- **Status Tracking**: Registration fee payment status
- **Search & Filter**: By name, NIC, phone number

### 3. Sales Management
- **Transaction Recording**: New tire sales with payment tracking
- **Initial Payment**: ₹610 collection and recording
- **Balance Calculation**: Automatic calculation of remaining ₹5,700
- **Status Tracking**: Active, completed, defaulted sales

### 4. Payment Management
- **Daily Installments**: ₹57 minimum daily payments
- **Flexible Payments**: Accept more than ₹57 per day
- **Payment History**: Complete payment trail per customer
- **Balance Updates**: Real-time outstanding balance calculation
- **Payment Methods**: Cash, bank transfer, cheque options

### 5. Inventory Management
- **Stock Tracking**: Current tire inventory levels
- **Reorder Alerts**: Low stock notifications
- **Purchase Recording**: New stock arrivals
- **Sales Impact**: Automatic inventory reduction on sales

### 6. Analytics & Reporting
- **Dashboard Overview**: Key business metrics
- **Sales Analytics**: Daily, weekly, monthly sales trends
- **Payment Analytics**: Collection rates and patterns
- **Customer Analytics**: Registration trends, payment behavior
- **Financial Reports**: Profit/loss, cash flow analysis
- **Predictive Analytics**: Future sales forecasting

## Technical Specifications

### 1. Platform Requirements
- **Type**: Web-based application
- **Access**: Internet browser (desktop & mobile)
- **Responsiveness**: Mobile-friendly interface
- **Offline**: Basic functionality when internet is limited

### 2. Database Requirements
- **Solution**: Supabase (PostgreSQL-based)
- **Features**: Real-time data synchronization
- **Backup**: Automated daily backups
- **Security**: Row-level security, encrypted data

### 3. User Interface
- **Design**: Clean, intuitive interface
- **Navigation**: Easy menu structure
- **Forms**: Simple data entry forms
- **Charts**: Visual analytics and reports
- **Print**: Printable receipts and reports

### 4. Security Features
- **Authentication**: Secure password-based login
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted sensitive information
- **Audit Trail**: Log all user actions
- **Session Management**: Automatic logout after inactivity

## Functional Requirements

### 1. Customer Registration
- Collect customer personal information
- Validate NIC number uniqueness
- Record ₹250 registration fee payment
- Generate customer profile
- Issue customer ID

### 2. Tire Sales Process
- Select customer (existing or new)
- Record ₹610 initial payment
- Calculate ₹5,700 remaining balance
- Set up installment schedule
- Update inventory count
- Generate sale receipt

### 3. Payment Collection
- Daily payment entry (minimum ₹57)
- Update remaining balance
- Track payment history
- Generate payment receipts
- Handle overpayments
- Mark completed sales

### 4. Reporting System
- Daily sales summary
- Payment collection report
- Outstanding balances report
- Customer list with status
- Inventory status report
- Monthly business analysis

## Non-Functional Requirements

### 1. Performance
- **Response Time**: < 2 seconds for normal operations
- **Concurrent Users**: Support 10+ simultaneous users
- **Data Loading**: Efficient data retrieval and display
- **Scalability**: Handle growing customer base

### 2. Reliability
- **Uptime**: 99%+ availability
- **Data Integrity**: Consistent and accurate data
- **Error Handling**: Graceful error management
- **Recovery**: Quick recovery from failures

### 3. Usability
- **Learning Curve**: Minimal training required
- **Interface**: Intuitive for non-technical users
- **Help**: Built-in guidance and tooltips
- **Accessibility**: Easy navigation and operation

### 4. Maintenance
- **Updates**: Easy system updates
- **Monitoring**: System health monitoring
- **Support**: Technical support availability
- **Documentation**: Complete user manuals

## Success Criteria

### 1. Business Impact
- Reduce manual paperwork by 90%
- Improve payment tracking accuracy
- Increase collection efficiency
- Better customer relationship management
- Enhanced business decision making

### 2. User Adoption
- Staff can use system within 1 day of training
- 100% of transactions recorded digitally
- Daily usage by all staff members
- Positive user feedback

### 3. Technical Performance
- System loads within 2 seconds
- Zero data loss incidents
- 99%+ system availability
- Successful backup and recovery testing

## Future Enhancements

### Phase 2 Features
- SMS notifications for payment reminders
- Customer self-service portal
- Mobile app for field staff
- Integration with accounting software
- Advanced analytics and AI insights

### Potential Expansions
- Multiple product lines
- Multi-location support
- Franchise management
- E-commerce integration
- API for third-party integrations

## Risk Management

### 1. Technical Risks
- **Data Loss**: Regular backups and recovery procedures
- **System Downtime**: Redundancy and quick recovery plans
- **Security Breaches**: Strong security measures and monitoring
- **Performance Issues**: Regular monitoring and optimization

### 2. Business Risks
- **User Resistance**: Comprehensive training and support
- **Data Migration**: Careful planning and testing
- **Process Changes**: Gradual implementation and feedback
- **Cost Overruns**: Clear budget and scope management

### 3. Mitigation Strategies
- Regular system backups
- User training programs
- Technical support availability
- Phased implementation approach
- Regular system monitoring and maintenance
