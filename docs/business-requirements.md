# Business Requirements Document (BRD)

## Executive Summary

The ValueMax Vampire Frontend represents a strategic modernization initiative to replace the legacy desktop application with a contemporary web-based solution. This project focuses on maintaining operational efficiency while upgrading the technological foundation for ValueMax's pawnshop operations.

## Project Context

### Current State
- Legacy desktop application in use across all outlets
- Manual, forms-based transaction processing
- Limited integration capabilities
- Desktop-dependent operations

### Future State
- Modern web application accessible from any device
- Streamlined workflows with preserved muscle memory
- Enhanced data validation and error prevention
- Cloud-ready architecture for scalability

## System Overview

### Primary Functions
1. **Ticket Renewals (FUNC-01)**
2. **Ticket Redemptions (FUNC-02)**
3. **Customer Enquiry (FUNC-03)**
4. **Lost Pledge Reporting (FUNC-04)**
5. **Lost Letter Reprinting (FUNC-05)**
6. **Combined Operations (FUNC-06)**
7. **Credit Rating Assessment (FUNC-07)**

### User Base
- **Primary Users:** Outlet staff (pawnshop branch personnel)
- **Usage Pattern:** High-frequency daily operations
- **Technical Proficiency:** Moderate (familiar with desktop applications)
- **Environment:** Fast-paced transaction processing

## Detailed Functional Requirements

### FUNC-01: Ticket Renewal Process

#### User Story
> AS AN Outlet Staff  
> I WANT TO renew single or multiple tickets  
> SO THAT I CAN extend the validity of pawned items efficiently

#### Workflow Steps
1. **Ticket Entry**
   - Input ticket number in designated field
   - Press Enter to trigger lookup
   - System validates ticket existence and status

2. **Information Display**
   - Show pledge details in structured table
   - Display customer information
   - Calculate renewal amounts automatically

3. **Payment Processing**
   - Accept cash and/or digital payments
   - Validate collected amount ≥ total amount
   - Real-time amount calculation

4. **Staff Authentication**
   - Staff code and PIN entry
   - Validate authentication credentials
   - Display staff name upon successful validation

5. **Transaction Completion**
   - Update ticket status from U/O to R
   - Create new ticket record with status U
   - Generate receipt and contract documents

#### Business Rules
- Ticket must exist in database
- Ticket status must be U (active) or O (reopened)
- PawnDate must differ from current date
- Collected amount must equal or exceed total amount
- Valid staff authentication required

#### Success Criteria
- Transaction completed in < 60 seconds
- Zero data entry errors
- Automatic document generation
- Status updates reflected immediately

### FUNC-02: Ticket Redemption Process

#### User Story (Same Redeemer)
> AS AN Outlet Staff  
> I WANT TO redeem tickets when redeemer equals pawner  
> SO THAT I CAN complete standard redemption process

#### User Story (Different Redeemer)
> AS AN Outlet Staff  
> I WANT TO redeem tickets when redeemer differs from pawner  
> SO THAT I CAN handle authorized third-party redemptions

#### Workflow Steps
1. **Ticket Validation**
   - Enter ticket number and validate
   - Display pledge and customer information
   - Verify ticket eligibility for redemption

2. **Redeemer Verification**
   - Select redeemer type (Pawner/Other)
   - For "Other": validate ID or create new customer
   - Handle customer data entry if not in system

3. **Payment Collection**
   - Calculate total redemption amount
   - Process cash/digital payments
   - Validate payment completeness

4. **Authorization**
   - Single staff auth for same redeemer
   - Dual staff auth for different redeemer
   - Appraiser and key-in staff validation

5. **Transaction Finalization**
   - Update ticket status to R (redeemed)
   - Generate receipt documentation
   - Handle promotion voidance if applicable

#### Business Rules
- Different redeemer requires dual staff authorization
- New customer creation requires complete data entry
- Promotion voidance warning for different redeemer
- Payment validation mandatory

### FUNC-03: Universal Enquiry System

#### User Story
> AS AN Outlet Staff  
> I WANT TO search customers and tickets using various criteria  
> SO THAT I CAN quickly find relevant information

#### Search Capabilities
1. **Customer Search**
   - By name (partial matching supported)
   - By NRIC/ID (exact match)
   - Historical transaction data

2. **Ticket Search**
   - By ticket number (format: A/MMYY/XXXX)
   - By MMYY (month/year combination)
   - By expiry date (DD format)
   - By pledge code (5-character alphanumeric)

3. **Advanced Filtering**
   - Date range selection
   - Status filtering (U/O/R)
   - Custom criteria combinations

#### Search Intelligence
- Auto-detection of input format
- Fuzzy matching for names
- Real-time search suggestions
- Export capabilities for results

### FUNC-04: Lost Pledge Management

#### User Story (Single Item)
> AS AN Outlet Staff  
> I WANT TO report a single lost pledge  
> SO THAT I CAN initiate the lost item process

#### User Story (Multiple Items)
> AS AN Outlet Staff  
> I WANT TO report multiple lost pledges  
> SO THAT I CAN efficiently handle bulk lost reports

#### Process Requirements
1. **Lost Item Identification**
   - Single or multiple ticket entry
   - Validate all items belong to same customer (multi-item)
   - Verify ticket status (U/O required)

2. **Fee Collection**
   - Calculate lost report fees
   - Process payment collection
   - Validate payment completeness

3. **Documentation**
   - Generate lost letter
   - Create receipt for fees
   - Update lost item database

4. **Staff Authorization**
   - Single staff authentication
   - Transaction logging

### FUNC-05: Lost Letter Reprinting

#### User Story
> AS AN Outlet Staff  
> I WANT TO reprint lost letters using receipt numbers  
> SO THAT I CAN provide duplicate documentation to customers

#### Requirements
- Receipt number validation
- Status verification (must be 'RESOLVE')
- Exact document reproduction
- No fee collection required

### FUNC-06: Combined Operations

#### User Story (Same Redeemer)
> AS AN Outlet Staff  
> I WANT TO process renewals and redemptions simultaneously  
> SO THAT I CAN handle complex transactions efficiently

#### User Story (Different Redeemer)
> AS AN Outlet Staff  
> I WANT TO process combined operations with different redeemer  
> SO THAT I CAN manage complex customer scenarios

#### Process Complexity
- Multiple ticket types in single transaction
- Mixed renewal and redemption processing
- Consolidated payment handling
- Enhanced authorization requirements

### FUNC-07: Credit Rating Assessment

#### User Story
> AS AN Outlet Staff  
> I WANT TO view customer credit ratings  
> SO THAT I CAN assess risk and make informed decisions

#### Information Display
- Customer identification and verification
- Credit usage patterns
- Outstanding amounts and limits
- Risk assessment indicators
- Historical performance metrics

#### Debug Capabilities
- Detailed customer analytics
- Transaction history analysis
- Risk factor identification

## Technical Requirements

### Performance Standards
- Page load time: < 2 seconds
- Form submission: < 1 second
- Search operations: < 500ms
- Keyboard shortcuts: < 100ms response

### Data Integration
- Real-time database connectivity
- Transaction consistency
- Audit trail maintenance
- Backup and recovery capabilities

### Security Requirements
- Staff authentication mandatory
- Dual authorization for sensitive operations
- Data encryption in transit and at rest
- Session management and timeout

### User Experience Standards
- Keyboard navigation support
- Muscle memory preservation from legacy system
- Error prevention and recovery
- Accessibility compliance (WCAG 2.1 AA)

## Business Rules Summary

### Ticket Status Management
- **Status 'U'**: Active/newly created tickets
- **Status 'O'**: Reopened (returned from police seizure)
- **Status 'R'**: Renewed or redeemed
- **Status 'V'**: Void/cancelled

### Authentication Requirements
- Single staff auth: Standard operations
- Dual staff auth: Different redeemer scenarios
- Staff code + PIN validation required
- Session management for security

### Payment Validation
- Collected amount ≥ total amount (always)
- Support for cash and digital payments
- Real-time calculation and validation
- Payment reconciliation tracking

### Error Handling Standards
- Specific, actionable error messages
- No blame language in user communications
- Recovery paths for all error scenarios
- Comprehensive validation at each step

## Success Metrics

### Operational Efficiency
- Transaction processing time reduction: 20%
- Error rate reduction: 50%
- Staff training time: < 2 hours
- System availability: 99.9%

### User Satisfaction
- Staff approval rating: > 90%
- Keyboard shortcut usage: > 80%
- Error recovery success: > 95%
- Performance satisfaction: > 90%

### Technical Performance
- Response time compliance: > 98%
- Zero data loss incidents
- Backup success rate: 100%
- Security incident rate: 0

## Risk Mitigation

### Training Requirements
- Comprehensive staff training program
- Keyboard shortcut familiarization
- Error handling procedures
- Emergency backup processes

### Change Management
- Phased rollout approach
- Parallel system operation period
- User feedback integration
- Continuous improvement process

### Technical Risks
- Database migration validation
- Performance monitoring
- Security testing
- Disaster recovery planning

---

**Document Version:** 1.0  
**Created:** May 16, 2025  
**Last Updated:** July 10, 2025  
**Approved By:** ValueMax Operations Team
