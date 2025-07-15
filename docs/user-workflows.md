# User Workflows & Interaction Patterns

## Overview

This document defines the critical user workflows for ValueMax outlet staff, emphasizing the preservation of muscle memory from the legacy desktop system while modernizing the user experience.

## Core Workflow Principles

### 1. Muscle Memory Preservation
- **Keyboard Shortcuts**: Maintain exact same key combinations as legacy system
- **Enter Key Behavior**: Primary action trigger across all forms
- **Tab Navigation**: Logical field-to-field progression
- **Escape Routes**: Consistent cancellation and back navigation

### 2. Error Prevention & Recovery
- **Real-time Validation**: Immediate feedback on invalid inputs
- **Contextual Help**: Inline guidance without disrupting flow
- **Graceful Degradation**: System remains functional during partial failures
- **Clear Recovery Paths**: Always provide next steps for error resolution

### 3. Efficiency Optimization
- **Single-Action Completion**: Minimize clicks for common tasks
- **Batch Operations**: Support for multiple ticket processing
- **Smart Defaults**: Pre-populate fields based on context
- **Quick Access**: One-click access to frequent functions

## Primary Workflows

### WORKFLOW 1: Ticket Renewal Process

#### User Goal
Process single or multiple ticket renewals to extend pledge validity.

#### Entry Points
- **Enhanced Command Palette**: Press `Ctrl+K`, type "renew" or ticket number (B/0725/1234)
- **Main Dashboard**: "Renew Ticket" quick action card (F1 shortcut)
- **Navigation Sidebar**: "Renewals" menu item
- **F4 Shortcut**: Direct keyboard access from any page

#### Detailed Flow

##### Step 1: Ticket Entry
```
┌─────────────────────────────────────────┐
│ Ticket Renewal                          │
├─────────────────────────────────────────┤
│                                         │
│ Ticket Number: [B/0725/1234        ] * │
│ Press Enter to lookup ticket details   │
│                                         │
│ [Add Another Ticket] [Continue →]      │
└─────────────────────────────────────────┘
```

**User Actions:**
1. **Focus**: Cursor automatically placed in ticket number field
2. **Input**: Type ticket number (auto-format: B/MMYY/XXXX)
3. **Trigger**: Press Enter (muscle memory from legacy system)
4. **Validation**: Real-time format validation with immediate feedback

**System Response:**
- **Valid Ticket**: Display pledge information table below
- **Invalid Format**: Show format error with example
- **Ticket Not Found**: Display clear error with suggestions
- **Status Invalid**: Explain why ticket cannot be renewed

**Keyboard Shortcuts:**
- `Ctrl+K`: Open Enhanced Command Palette for ticket search
- `F4`: Direct access to Ticket Renewal from any page
- `Enter`: Lookup ticket and proceed
- `Tab`: Navigate to "Add Another Ticket" button
- `Escape`: Clear current input and start over

##### Step 2: Information Review
```
┌─────────────────────────────────────────┐
│ Pledge Details                          │
├─────────────────────────────────────────┤
│ Pledge No: PL001234    Weight: 15.2g    │
│ Principal: $800.00     Interest: $24.00 │
│ Months: 3              New Amt: $824.00 │
├─────────────────────────────────────────┤
│ Customer: John Tan Wei Ming             │
│ Contract: CT240725001                   │
│ Total Renewal: $24.00                   │
├─────────────────────────────────────────┤
│ [← Back] [Add More] [Continue →]        │
└─────────────────────────────────────────┘
```

**User Actions:**
1. **Review**: Verify customer and amount information
2. **Multiple Tickets**: Option to add additional tickets
3. **Proceed**: Continue to payment when ready

**System Behavior:**
- **Auto-calculation**: Running totals for multiple tickets
- **Validation**: Ensure all tickets belong to same customer (if required)
- **Status Check**: Verify all tickets are eligible for renewal

##### Step 3: Payment Processing
```
┌─────────────────────────────────────────┐
│ Payment Collection                      │
├─────────────────────────────────────────┤
│ Cash Payment:    [    0.00] SGD         │
│ Digital Payment: [   24.00] SGD         │
│ Reference No:    [TXN123456]            │
├─────────────────────────────────────────┤
│ Total Due:       $24.00                 │
│ Collected:       $24.00 ✓               │
├─────────────────────────────────────────┤
│ [← Back] [Process Payment →]            │
└─────────────────────────────────────────┘
```

**User Actions:**
1. **Amount Entry**: Enter cash and/or digital payment amounts
2. **Real-time Validation**: System calculates total immediately
3. **Reference Numbers**: Auto-generated for digital payments
4. **Confirmation**: Proceed when payment equals or exceeds total

**Payment Rules:**
- Collected Amount ≥ Total Amount (mandatory)
- Support mixed payment methods
- Digital payments require reference numbers
- Real-time calculation and validation

**Keyboard Shortcuts:**
- `Tab`: Navigate between payment fields
- `Enter`: Proceed to staff authentication (when payment valid)
- `Ctrl+C`: Copy reference number to clipboard

##### Step 4: Staff Authentication
```
┌─────────────────────────────────────────┐
│ Staff Authentication                    │
├─────────────────────────────────────────┤
│ Staff Code: [SC001          ]           │
│ PIN:        [••••           ]           │
├─────────────────────────────────────────┤
│ Staff Name: Sarah Chen                  │
│ Role: Senior Staff                      │
├─────────────────────────────────────────┤
│ [← Back] [Complete Transaction →]       │
└─────────────────────────────────────────┘
```

**User Actions:**
1. **Staff Code**: Enter unique staff identifier
2. **PIN Entry**: Secure PIN validation
3. **Verification**: System displays staff name for confirmation
4. **Final Submission**: Complete the transaction

**Security Requirements:**
- PIN masking for security
- Session timeout after inactivity
- Invalid attempt tracking
- Automatic logout on multiple failures

**Keyboard Shortcuts:**
- `Tab`: Move from Staff Code to PIN
- `Enter`: Complete authentication and process transaction
- `Escape`: Cancel transaction and return to start

##### Step 5: Transaction Completion
```
┌─────────────────────────────────────────┐
│ Transaction Successful ✓                │
├─────────────────────────────────────────┤
│ Ticket B/0725/1234 renewed successfully │
│ New expiry date: July 25, 2026         │
│                                         │
│ Receipt #: RCP240725001                 │
│ Contract #: CT240725002                 │
├─────────────────────────────────────────┤
│ [Print Receipt] [Print Contract]        │
│ [Process Another] [Return to Dashboard] │
└─────────────────────────────────────────┘
```

**System Actions:**
1. **Database Updates**: Change ticket status from U to R, create new U record
2. **Document Generation**: Create receipt and contract documents
3. **Audit Logging**: Record transaction details for compliance
4. **Print Queue**: Prepare documents for printing

**User Options:**
- **Print Documents**: Generate physical receipts and contracts
- **Continue Processing**: Start another renewal immediately
- **Return to Dashboard**: Complete session and return to main menu

#### Error Scenarios & Recovery

##### Invalid Ticket Number
```
┌─────────────────────────────────────────┐
│ ❌ Error: Invalid Ticket Format          │
├─────────────────────────────────────────┤
│ Please use format: B/MMYY/XXXX          │
│ Example: B/0725/1234                    │
│                                         │
│ Ticket Number: [B0725/1234      ]       │
│                ↑ Missing slash          │
├─────────────────────────────────────────┤
│ [Try Again] [Clear] [Help]              │
└─────────────────────────────────────────┘
```

**Recovery Actions:**
- Clear error message when user starts typing
- Provide visual indicators of format requirements
- Offer quick-fix suggestions where possible
- Maintain focus on problematic field

##### Insufficient Payment
```
┌─────────────────────────────────────────┐
│ ⚠️ Warning: Insufficient Payment         │
├─────────────────────────────────────────┤
│ Total Required: $24.00                  │
│ Amount Collected: $20.00                │
│ Shortfall: $4.00                        │
├─────────────────────────────────────────┤
│ Please collect additional payment       │
│ or adjust the amounts below:            │
│                                         │
│ Cash Payment: [20.00] SGD               │
│ Digital Payment: [0.00] SGD             │
└─────────────────────────────────────────┘
```

**Recovery Options:**
- Highlight insufficient amount in red
- Calculate and display exact shortfall
- Allow easy adjustment of payment amounts
- Prevent progression until payment is adequate

### WORKFLOW 2: Customer Enquiry Process

#### User Goal
Search for customers and tickets using various criteria to access transaction history and current status.

#### Entry Points
- Main dashboard search bar
- Navigation sidebar "Enquiry" menu item
- Quick search from any page header

#### Universal Search Interface
```
┌─────────────────────────────────────────┐
│ Universal Search                        │
├─────────────────────────────────────────┤
│ 🔍 [John Tan                      ] 🔄  │
│                                         │
│ Search recognizes:                      │
│ • Customer names (John Tan)             │
│ • NRIC/ID (S1234567A)                   │
│ • Ticket numbers (B/0725/1234)          │
│ • MMYY format (0725)                    │
│ • Expiry dates (25)                     │
│ • Pledge codes (PL123)                  │
└─────────────────────────────────────────┘
```

**Smart Search Features:**
1. **Auto-detection**: System recognizes input type automatically
2. **Partial Matching**: Support for incomplete customer names
3. **Format Flexibility**: Accept various input formats
4. **Real-time Suggestions**: Show matching results as user types

**Search Types & Behaviors:**

##### Customer Name Search
- **Input**: "John Tan" (partial names supported)
- **Recognition**: Text pattern without numbers or special formats
- **Results**: All customers with matching names
- **Sort Order**: Alphabetical, then by recent activity

##### NRIC/ID Search
- **Input**: "S1234567A" (exact match required)
- **Recognition**: Singapore/Malaysia NRIC pattern
- **Results**: Single customer with complete transaction history
- **Security**: Mask sensitive information in results

##### Ticket Number Search
- **Input**: "B/0725/1234" (size/month/year/sequence)
- **Recognition**: Specific ticket format pattern
- **Results**: Individual ticket with full details
- **Context**: Customer info, pledge details, transaction history

##### MMYY Search
- **Input**: "0725" (month/year combination)
- **Recognition**: Four-digit numeric pattern
- **Results**: All tickets from specified month/year
- **Pagination**: Large result sets with filtering options

#### Advanced Filtering
```
┌─────────────────────────────────────────┐
│ Advanced Search Filters                 │
├─────────────────────────────────────────┤
│ Date Range:                             │
│ From: [25/06/2024] To: [25/07/2025]     │
│                                         │
│ Status Filter:                          │
│ ☑️ Active (U)  ☑️ Reopened (O)           │
│ ☑️ Redeemed (R) ❌ Void (V)              │
│                                         │
│ Amount Range:                           │
│ Min: [    0.00] Max: [10,000.00]        │
├─────────────────────────────────────────┤
│ [Clear Filters] [Apply Filters →]       │
└─────────────────────────────────────────┘
```

#### Search Results Display
```
┌─────────────────────────────────────────┐
│ Search Results (3 found)                │
├─────────────────────────────────────────┤
│ Customer      NRIC       Ticket#   Amt  │
│ John Tan WM   S1234567A  B/0725/1  $800 │
│ John Tan WM   S1234567A  S/0625/5  $450 │
│ John Tan BH   S9876543B  B/0725/9  $1.2K│
├─────────────────────────────────────────┤
│ [View Details] [Export] [Print List]    │
│                                         │
│ Showing 1-3 of 3 results               │
└─────────────────────────────────────────┘
```

**Result Actions:**
- **View Details**: Open detailed transaction view
- **Export Data**: Download results as CSV/Excel
- **Print List**: Generate printable report
- **Quick Actions**: Renew, redeem, or update from results

### WORKFLOW 3: Redemption Process

#### User Goal
Process ticket redemption when customer wants to reclaim pledged items.

#### Flow Variations

##### Same Redeemer (Pawner = Redeemer)
**Simplified Process:**
1. Ticket lookup and validation
2. Payment collection (if outstanding)
3. Single staff authentication
4. Transaction completion

##### Different Redeemer (Pawner ≠ Redeemer)
**Enhanced Security Process:**
1. Ticket lookup and validation
2. Redeemer identification and verification
3. Customer data entry (if new redeemer)
4. Payment collection
5. Dual staff authentication (Appraiser + Key-in)
6. Promotion voidance notification
7. Transaction completion

#### Different Redeemer Workflow Detail

##### Step 1: Redeemer Verification
```
┌─────────────────────────────────────────┐
│ Redeemer Identification                 │
├─────────────────────────────────────────┤
│ Original Pawner: John Tan Wei Ming      │
│ NRIC: S1234567A                         │
├─────────────────────────────────────────┤
│ Redeemer Type:                          │
│ ◯ Pawner (Same person)                  │
│ ◉ Other (Different person)              │
│                                         │
│ Redeemer ID: [S9876543B          ]      │
├─────────────────────────────────────────┤
│ [Lookup] [Manual Entry] [Cancel]        │
└─────────────────────────────────────────┘
```

##### Step 2: Customer Data Entry (if required)
```
┌─────────────────────────────────────────┐
│ New Customer Registration               │
├─────────────────────────────────────────┤
│ NRIC No: [S9876543B] DOB: [151290]     │
│ Name: [Mary Lim Siew Choo          ] *  │
│ Race: [C] Sex: [F] Nationality: [S]     │
│                                         │
│ Address: [123 Orchard Road         ] *  │
│ Postal: [238841] Unit: [#12-34]         │
│ Contact: [91234567]                     │
├─────────────────────────────────────────┤
│ [Save Customer] [Cancel]                │
└─────────────────────────────────────────┘
```

**Required Fields (*):**
- NRIC Number, DOB, Name, Race, Sex, Nationality, Address

**Auto-validation:**
- NRIC format validation
- DOB format and age verification
- Postal code validation
- Contact number format

##### Step 3: Promotion Voidance Warning
```
┌─────────────────────────────────────────┐
│ ⚠️ Important Notice                      │
├─────────────────────────────────────────┤
│ Promotion of Ticket B/0725/1234        │
│ is void due to different redeemer.      │
│                                         │
│ Original benefits/discounts will        │
│ not apply to this redemption.           │
├─────────────────────────────────────────┤
│ Do you wish to continue?                │
│                                         │
│ [Continue] [Cancel]                     │
└─────────────────────────────────────────┘
```

##### Step 4: Dual Staff Authentication
```
┌─────────────────────────────────────────┐
│ Staff Authentication (1 of 2)           │
├─────────────────────────────────────────┤
│ Appraiser Staff                         │
│ Staff Code: [AP001] PIN: [••••]         │
│ Name: Michael Wong                      │
├─────────────────────────────────────────┤
│ Key-in Staff                            │
│ Staff Code: [KI002] PIN: [••••]         │
│ Name: Sarah Chen                        │
├─────────────────────────────────────────┤
│ [Authenticate] [Cancel]                 │
└─────────────────────────────────────────┘
```

**Dual Authentication Requirements:**
- Two different staff members required
- Appraiser role for verification
- Key-in role for data entry
- Both staff must be present and authenticated

### WORKFLOW 4: Lost Pledge Reporting

#### User Goal
Report lost or misplaced pledge items and generate necessary documentation.

#### Single vs. Multiple Item Reporting

##### Single Item Process
```
┌─────────────────────────────────────────┐
│ Lost Pledge Report                      │
├─────────────────────────────────────────┤
│ Ticket Number: [B/0725/1234       ]     │
│                                         │
│ Customer: John Tan Wei Ming             │
│ Item: Gold Chain (15.2g)                │
│ Principal: $800.00                      │
├─────────────────────────────────────────┤
│ Lost Report Fee: $25.00                 │
│                                         │
│ Payment: [Cash: 25.00] [Digital: 0.00]  │
├─────────────────────────────────────────┤
│ [Process Report] [Cancel]               │
└─────────────────────────────────────────┘
```

##### Multiple Items Process
```
┌─────────────────────────────────────────┐
│ Multiple Lost Items Report              │
├─────────────────────────────────────────┤
│ Customer: John Tan Wei Ming (S1234567A) │
├─────────────────────────────────────────┤
│ Ticket 1: B/0725/1234  Fee: $25.00     │
│ Ticket 2: S/0625/5678  Fee: $15.00     │
│ Ticket 3: B/0425/9012  Fee: $25.00     │
├─────────────────────────────────────────┤
│ Total Fees: $65.00                     │
│                                         │
│ [Add More Tickets] [Process All]        │
└─────────────────────────────────────────┘
```

**Multiple Item Rules:**
- All tickets must belong to same customer
- Individual fee calculation per ticket
- Consolidated payment collection
- Single receipt for all items

### WORKFLOW 5: Combined Operations

#### User Goal
Process both renewals and redemptions in a single transaction for efficiency.

#### Complex Transaction Flow
```
┌─────────────────────────────────────────┐
│ Combined Renewal & Redemption           │
├─────────────────────────────────────────┤
│ Renewal Tickets:                        │
│ • B/0725/1234  Interest: $24.00        │
│ • S/0625/5678  Interest: $18.00        │
│                                         │
│ Redemption Tickets:                     │
│ • B/0425/9012  Total: $450.00          │
│ • T/0325/3456  Total: $125.00          │
├─────────────────────────────────────────┤
│ Grand Total: $617.00                    │
│                                         │
│ [Review All] [Modify] [Process →]       │
└─────────────────────────────────────────┘
```

**Process Complexity:**
- Multiple ticket types in single transaction
- Mixed renewal and redemption processing
- Consolidated payment handling
- Enhanced authorization requirements
- Separate document generation for each type

## Keyboard Shortcut Reference

### Global Shortcuts
| Key Combination | Action | Context |
|-----------------|--------|---------|
| `Ctrl + /` | Show help overlay | Any page |
| `Ctrl + K` | Open universal search | Any page |
| `Alt + D` | Go to dashboard | Any page |
| `Alt + R` | Go to renewals | Any page |
| `Alt + E` | Go to enquiry | Any page |
| `Escape` | Cancel current action | Any form |
| `F1` | Context-sensitive help | Any field |

### Form Navigation
| Key | Action | Context |
|-----|--------|---------|
| `Tab` | Next field | Any form |
| `Shift + Tab` | Previous field | Any form |
| `Enter` | Submit/Continue | Primary actions |
| `Space` | Toggle checkbox/radio | Selection controls |
| `Arrow Keys` | Navigate options | Dropdown menus |

### Transaction Shortcuts
| Key Combination | Action | Context |
|-----------------|--------|---------|
| `Ctrl + Enter` | Complete transaction | Payment forms |
| `Ctrl + P` | Print receipt | Transaction complete |
| `Ctrl + N` | New transaction | Any transaction page |
| `Ctrl + S` | Save draft | Long forms |
| `F5` | Refresh data | Data tables |

### Quick Entry
| Key | Action | Context |
|-----|--------|---------|
| `F2` | Edit mode | Data tables |
| `F3` | Quick search | Enquiry pages |
| `F4` | Advanced filters | Search results |
| `F9` | Calculator | Amount fields |
| `F12` | Staff authentication | Secure actions |

## Error Handling Patterns

### Validation Error Display
```
┌─────────────────────────────────────────┐
│ ❌ Validation Errors Found               │
├─────────────────────────────────────────┤
│ • Ticket Number: Invalid format         │
│   Expected: B/MMYY/XXXX                 │
│                                         │
│ • Payment Amount: Insufficient          │
│   Need additional $4.50                 │
│                                         │
│ • Staff PIN: Authentication failed      │
│   Please re-enter PIN                   │
├─────────────────────────────────────────┤
│ [Fix Errors] [Start Over] [Get Help]    │
└─────────────────────────────────────────┘
```

### Network Error Recovery
```
┌─────────────────────────────────────────┐
│ 🔄 Connection Lost                       │
├─────────────────────────────────────────┤
│ Unable to connect to server.            │
│ Your work has been saved locally.       │
│                                         │
│ Attempting to reconnect...              │
│                                         │
│ [Retry Now] [Work Offline] [Help]       │
└─────────────────────────────────────────┘
```

### System Error Fallback
```
┌─────────────────────────────────────────┐
│ ⚠️ System Error                          │
├─────────────────────────────────────────┤
│ An unexpected error occurred.           │
│                                         │
│ Error ID: ERR-2025-0710-1423           │
│                                         │
│ Your transaction was not completed.     │
│ Please try again or contact support.    │
├─────────────────────────────────────────┤
│ [Try Again] [Report Issue] [Contact IT] │
└─────────────────────────────────────────┘
```

## Accessibility Patterns

### Screen Reader Support
- **Descriptive Labels**: All form fields have clear, descriptive labels
- **Status Announcements**: Important status changes announced to screen readers
- **Error Descriptions**: Detailed error descriptions linked to form fields
- **Navigation Landmarks**: Proper heading structure and landmarks

### Keyboard Navigation
- **Logical Tab Order**: Tab progression follows visual layout
- **Skip Links**: Quick navigation to main content areas
- **Focus Indicators**: Clear visual focus indicators
- **Trapped Focus**: Modal dialogs trap focus appropriately

### Visual Accessibility
- **High Contrast**: Minimum 4.5:1 contrast ratio for all text
- **Color Independence**: Never rely solely on color for information
- **Text Scaling**: Support up to 200% text scaling
- **Motion Sensitivity**: Respect reduced motion preferences

## Performance Considerations

### Response Time Targets
- **Keyboard Input**: < 100ms response to keystrokes
- **Form Submission**: < 1 second for simple forms
- **Search Results**: < 500ms for basic queries
- **Page Navigation**: < 2 seconds initial load

### Optimization Strategies
- **Predictive Loading**: Pre-load likely next steps
- **Smart Caching**: Cache frequently accessed data
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Offline Capability**: Basic operations work offline

### User Feedback
- **Loading Indicators**: Show progress for operations > 200ms
- **Optimistic Updates**: Update UI immediately for likely successful actions
- **Status Messages**: Clear feedback for all user actions
- **Progress Tracking**: Show progress for multi-step operations

---

**Document Version:** 1.0  
**Created:** July 10, 2025  
**UX Lead:** 1CloudHub Design Team  
**Last Updated:** July 10, 2025
