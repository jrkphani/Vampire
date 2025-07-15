# ValueMax Vampire Frontend - Layout, Navigation & Functionality Specification

## Table of Contents

1. [Application Architecture](#application-architecture)
2. [Global Layout System](#global-layout-system)
3. [Navigation Structure](#navigation-structure)
4. [Page Layout Specifications](#page-layout-specifications)
5. [Command Palette Integration](#command-palette-integration)
6. [Keyboard Navigation](#keyboard-navigation)
7. [Responsive Design Guidelines](#responsive-design-guidelines)
8. [Component Usage Standards](#component-usage-standards)

---

## Application Architecture

### Design System Compliance

This specification strictly adheres to the **ValueMax Design System** (`docs/design-system.md`):

- **Color System**: Modern Professional Palette with ValueMax Brand Red (`#8B1538`) for primary actions
- **Typography**: Inter font family with monospace (JetBrains Mono) for data display
- **Spacing**: 8px base unit system (`--space-1` through `--space-16`)
- **Components**: shadcn/ui component library exclusively
- **Layout**: CSS Grid-based application shell with responsive breakpoints

### Application Shell Structure

```css
.app-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 70px 1fr;
  grid-template-areas: 
    "sidebar header"
    "sidebar main";
  height: 100vh;
  background: var(--color-surface);
}
```

---

## Global Layout System

### 1. Header Component (`app-header`)

**Location**: Top navigation bar (70px height)  
**Styling**: `background: white`, `border-bottom: 1px solid var(--color-border)`

**Elements**:
- **Left**: ValueMax logo with brand red accent
- **Center**: Global search bar (Command Palette trigger)
- **Right**: Staff information, notifications, settings dropdown

**Design Tokens Applied**:
```css
.app-header {
  padding: 0 var(--space-8);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
```

### 2. Sidebar Navigation (`app-sidebar`)

**Location**: Left navigation panel (260px width)  
**Styling**: `background: white`, `border-right: 1px solid var(--color-border)`

**Navigation Structure**:
```
📊 Dashboard
🔄 Transactions
  ├── Ticket Renewals (FUNC-01)        [F4]
  ├── Ticket Redemptions (FUNC-02)     [F5]
  ├── Combined Operations (FUNC-06)     [F7]
  └── Lost Pledge Management (FUNC-04)  [Alt+L]
🔍 Enquiry System (FUNC-03)            [F3]
📋 Reports
  ├── Credit Rating Assessment (FUNC-07) [Alt+CR]
  └── Lost Letter Reprinting (FUNC-05)    [F6]
⚙️ Settings
🆘 Help & Support
```

**Component Styling**:
```css
.nav-item {
  padding: var(--space-3) var(--space-4);
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
}

.nav-item.active {
  background: var(--color-brand-red);
  color: white;
  font-weight: 600;
}
```

### 3. Main Content Area (`app-main`)

**Location**: Primary content viewport  
**Styling**: `padding: var(--space-8)`, `background: var(--color-surface)`

**Layout Pattern**:
- **Content Cards**: Using design system `.card` classes
- **Form Sections**: Grid-based responsive layouts
- **Data Tables**: `.data-table` styling with proper spacing

---

## Navigation Structure

### Route Mapping

| Route | Component | Function | Keyboard |
|-------|-----------|----------|----------|
| `/` | Dashboard | Home overview | `Ctrl+Home` |
| `/transactions/renewal` | TicketRenewal | FUNC-01 | `F4` |
| `/transactions/redemption` | TicketRedemption | FUNC-02 | `F5` |
| `/transactions/combined` | CombinedOperations | FUNC-06 | `F7` |
| `/transactions/lost-pledge` | LostPledgeManagement | FUNC-04 | `Alt+L` |
| `/enquiry` | CustomerEnquiry | FUNC-03 | `F3` |
| `/reports/credit-rating` | CreditRatingAssessment | FUNC-07 | `Alt+CR` |
| `/reports/credit-rating/:id` | CreditRatingDetail | FUNC-07 | - |
| `/reports/lost-letter` | LostLetterReprinting | FUNC-05 | `F6` |
| `/settings` | SystemSettings | Configuration | `F12` |
| `/help` | HelpSupport | Documentation | `F1` |

### Breadcrumb Navigation

Following design system typography (`.text-caption`):
```
ValueMax > Transactions > Ticket Renewals
```

---

## Page Layout Specifications

### 1. Dashboard (`/`)

**Layout**: Grid-based widget system  
**Components**: Cards with hover effects (`.card-hover`)

**Structure**:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <!-- Quick Stats Cards -->
  <div class="card card-hover">
    <div class="card-header">
      <h3 class="card-title">Today's Transactions</h3>
    </div>
    <!-- Status badges using .status-badge classes -->
  </div>
</div>
```

**Design Elements**:
- **Quick Action Buttons**: Primary brand red for main functions
- **Recent Transactions Table**: `.data-table` with monetary formatting
- **Status Indicators**: Color-coded using `.status-active`, `.status-pending`, etc.

### 2. Ticket Renewals (`/transactions/renewal`) - FUNC-01

**Primary Layout**: Two-column form with ticket lookup and payment processing

**Key Sections**:

#### A. Ticket Information Section
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Ticket Information</h3>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3">
    <!-- Ticket Number Input -->
    <div class="form-group">
      <label class="form-label required">Ticket Number</label>
      <input class="input-field text-mono" 
             placeholder="B/MMYY/XXXX" 
             required />
      <div class="text-caption">Press Enter to lookup</div>
    </div>
  </div>
</div>
```

#### B. Payment Form Section
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Payment Information</h3>
  </div>
  <!-- Payment fields following BRD specifications -->
  <div class="grid grid-cols-1 md:grid-cols-2">
    <div class="form-group">
      <label class="form-label required">Total Amount</label>
      <div class="input-field monetary-value">$0.00</div>
    </div>
    <div class="form-group">
      <label class="form-label">Cash Payment</label>
      <input class="input-field" type="number" step="0.01" />
    </div>
    <div class="form-group">
      <label class="form-label">Digital Payment</label>
      <input class="input-field" type="number" step="0.01" />
    </div>
    <div class="form-group">
      <label class="form-label">Reference Number</label>
      <input class="input-field" type="text" />
    </div>
  </div>
</div>
```

#### C. Staff Authentication Section
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Staff Authentication</h3>
  </div>
  <!-- Staff code input as per BRD -->
</div>
```

**Action Buttons**:
```html
<div class="flex gap-4 justify-end">
  <button class="btn-tertiary">Cancel</button>
  <button class="btn-secondary">Save Draft</button>
  <button class="btn-primary">Process Renewal</button>
</div>
```

### 3. Ticket Redemptions (`/transactions/redemption`) - FUNC-02

**Layout**: Similar to renewals with additional redeemer verification

**Key Differences**:
- **Redeemer Identity Verification** section
- **Dual Staff Authentication** for different redeemer scenarios
- **Security warnings** using `.status-error` styling

### 4. Customer Enquiry (`/enquiry`) - FUNC-03

**Layout**: Search-focused interface with results display

**Primary Components**:

#### A. Universal Search Bar
```html
<div class="search-container">
  <div class="search-bar">
    <input class="search-input" 
           placeholder="Search by NRIC, Ticket Number, Phone, or Name..." />
    <div class="search-icon">🔍</div>
  </div>
</div>
```

#### B. Search Results Display
```html
<div class="grid grid-cols-1 gap-6">
  <!-- Customer Results -->
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Customer Results</h3>
    </div>
    <table class="data-table">
      <!-- Customer data with actions -->
    </table>
  </div>
  
  <!-- Ticket Results -->
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Ticket Results</h3>
    </div>
    <!-- Ticket data with status badges -->
  </div>
</div>
```

### 5. Lost Pledge Management (`/transactions/lost-pledge`) - FUNC-04

**Layout**: Form-based workflow for lost item reporting

**Sections**:
- **Ticket Selection**: Multi-ticket selection interface
- **Lost Item Details**: Description and documentation
- **Report Generation**: PDF output controls

### 6. Lost Letter Reprinting (`/reports/lost-letter`) - FUNC-05

**Layout**: Receipt-based document regeneration interface

**Primary Components**:

#### A. Receipt Lookup Section
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Receipt Information</h3>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2">
    <div class="form-group">
      <label class="form-label required">Receipt Number</label>
      <input class="input-field text-mono" 
             placeholder="RCP20250714001" 
             pattern="RCP[0-9]{11}" 
             required />
      <div class="text-caption">Format: RCP + Date + Sequence</div>
    </div>
    <div class="form-group">
      <label class="form-label">Transaction Date</label>
      <input class="input-field" type="date" />
    </div>
  </div>
</div>
```

#### B. Lost Letter Details Display
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Lost Letter Information</h3>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2">
    <!-- Customer Information -->
    <div class="space-y-4">
      <h4 class="text-h4">Customer Details</h4>
      <dl class="space-y-2">
        <div class="flex justify-between">
          <dt class="text-caption">Name:</dt>
          <dd class="text-mono font-medium">[Customer Name]</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-caption">NRIC:</dt>
          <dd class="text-mono font-medium">[NRIC Number]</dd>
        </div>
      </dl>
    </div>
    
    <!-- Transaction Information -->
    <div class="space-y-4">
      <h4 class="text-h4">Transaction Details</h4>
      <dl class="space-y-2">
        <div class="flex justify-between">
          <dt class="text-caption">Ticket Number:</dt>
          <dd class="text-mono font-medium">[Ticket Number]</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-caption">Amount:</dt>
          <dd class="monetary-value font-semibold">[Transaction Amount]</dd>
        </div>
      </dl>
    </div>
  </div>
</div>
```

#### C. Reprint Actions
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Reprint Options</h3>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="form-group">
      <label class="form-label">Letter Type</label>
      <select class="select-field">
        <option>Lost Pledge Letter</option>
        <option>Receipt Copy</option>
        <option>Transaction Summary</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Print Format</label>
      <select class="select-field">
        <option>Original Format</option>
        <option>Duplicate Copy</option>
        <option>Summary Version</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Copies</label>
      <input class="input-field" type="number" min="1" max="5" value="1" />
    </div>
  </div>
</div>
```

**Action Buttons**:
```html
<div class="flex gap-4 justify-end">
  <button class="btn-tertiary">Clear Form</button>
  <button class="btn-secondary">Preview Letter</button>
  <button class="btn-primary">Generate & Print</button>
</div>
```

### 7. Combined Operations (`/transactions/combined`) - FUNC-06

**Layout**: Multi-step wizard interface for simultaneous renewal and redemption processing

**Design Pattern**:
```html
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <!-- Main Form Area (2/3 width) -->
  <div class="lg:col-span-2">
    <div class="card">
      <!-- Step progress indicator -->
      <div class="card-header">
        <div class="flex items-center space-x-4 mb-4">
          <div class="step-indicator active">1</div>
          <div class="step-line"></div>
          <div class="step-indicator">2</div>
          <div class="step-line"></div>
          <div class="step-indicator">3</div>
          <div class="step-line"></div>
          <div class="step-indicator">4</div>
        </div>
        <h3 class="card-title" id="step-title">Step 1: Ticket Selection</h3>
      </div>
      
      <!-- Dynamic step content -->
      <div id="step-content">
        <!-- Step content loaded dynamically -->
      </div>
    </div>
  </div>
  
  <!-- Summary Sidebar (1/3 width) -->
  <div class="lg:col-span-1">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Transaction Summary</h3>
      </div>
      <div class="space-y-4">
        <!-- Renewals Summary -->
        <div class="summary-section">
          <h4 class="text-h4 text-success">Renewals</h4>
          <div id="renewal-summary" class="space-y-2">
            <div class="text-caption">No renewals selected</div>
          </div>
        </div>
        
        <!-- Redemptions Summary -->
        <div class="summary-section">
          <h4 class="text-h4 text-info">Redemptions</h4>
          <div id="redemption-summary" class="space-y-2">
            <div class="text-caption">No redemptions selected</div>
          </div>
        </div>
        
        <!-- Total Calculations -->
        <div class="border-t pt-4">
          <div class="flex justify-between font-semibold">
            <span>Total Amount:</span>
            <span class="monetary-value" id="total-amount">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### Step 1: Ticket Selection & Operation Type
```html
<div class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Ticket Lookup -->
    <div class="form-group">
      <label class="form-label required">Ticket Number</label>
      <input class="input-field text-mono" 
             placeholder="B/MMYY/XXXX" 
             id="ticket-lookup" />
      <button class="btn-secondary mt-2">Add Ticket</button>
    </div>
    
    <!-- Operation Selection -->
    <div class="form-group">
      <label class="form-label required">Operation Type</label>
      <div class="grid grid-cols-2 gap-2">
        <label class="radio-option">
          <input type="radio" name="operation" value="renew" />
          <span>Renew</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="operation" value="redeem" />
          <span>Redeem</span>
        </label>
      </div>
    </div>
  </div>
  
  <!-- Selected Tickets Table -->
  <div class="selected-tickets">
    <table class="data-table">
      <thead>
        <tr>
          <th>Ticket #</th>
          <th>Operation</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="selected-tickets-body">
        <!-- Dynamic ticket rows -->
      </tbody>
    </table>
  </div>
</div>
```

#### Step 2: Customer & Redeemer Verification
```html
<div class="space-y-6">
  <!-- Customer Information -->
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Customer Information</h4>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Customer Name</label>
        <input class="input-field" readonly />
      </div>
      <div class="form-group">
        <label class="form-label">NRIC</label>
        <input class="input-field text-mono" readonly />
      </div>
    </div>
  </div>
  
  <!-- Redeemer Verification (for redemptions) -->
  <div class="card" id="redeemer-section">
    <div class="card-header">
      <h4 class="card-title">Redeemer Verification</h4>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label required">Redeemer NRIC</label>
        <input class="input-field text-mono" required />
      </div>
      <div class="form-group">
        <label class="form-label required">Redeemer Name</label>
        <input class="input-field" required />
      </div>
    </div>
  </div>
</div>
```

#### Step 3: Payment Processing
```html
<div class="space-y-6">
  <!-- Payment Breakdown -->
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Payment Summary</h4>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        <!-- Dynamic payment rows -->
      </tbody>
    </table>
  </div>
  
  <!-- Payment Methods -->
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Payment Collection</h4>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="form-group">
        <label class="form-label">Cash Payment</label>
        <input class="input-field monetary-value" type="number" step="0.01" />
      </div>
      <div class="form-group">
        <label class="form-label">Digital Payment</label>
        <input class="input-field monetary-value" type="number" step="0.01" />
      </div>
      <div class="form-group">
        <label class="form-label">Reference Number</label>
        <input class="input-field" type="text" />
      </div>
    </div>
  </div>
</div>
```

#### Step 4: Staff Authentication & Final Review
```html
<div class="space-y-6">
  <!-- Transaction Review -->
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Transaction Review</h4>
    </div>
    <!-- Complete transaction summary -->
  </div>
  
  <!-- Staff Authentication -->
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Staff Authentication</h4>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label required">Primary Staff Code</label>
        <input class="input-field text-mono" type="password" required />
      </div>
      <div class="form-group" id="secondary-staff">
        <label class="form-label">Secondary Staff Code</label>
        <input class="input-field text-mono" type="password" />
        <div class="text-caption">Required for different redeemer</div>
      </div>
    </div>
  </div>
</div>
```

**Navigation Buttons**:
```html
<div class="flex justify-between mt-8">
  <button class="btn-tertiary" id="prev-step" disabled>Previous</button>
  <div class="flex gap-4">
    <button class="btn-secondary">Save Draft</button>
    <button class="btn-primary" id="next-step">Next Step</button>
    <button class="btn-primary hidden" id="process-combined">Process All Transactions</button>
  </div>
</div>
```

### 8. Credit Rating Assessment (`/reports/credit-rating`) - FUNC-07

**Layout**: Dashboard-style metrics display

**Components**:
- **Search Customer**: NRIC/Name input
- **Rating Cards**: Visual metric displays
- **History Charts**: Data visualization
- **Export Controls**: PDF/Excel output

### 9. System Settings (`/settings`) - Configuration Management

**Layout**: Tabbed interface for system configuration and user preferences

**Primary Sections**:

#### A. User Preferences Tab
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">User Preferences</h3>
  </div>
  <div class="space-y-6">
    <!-- Display Settings -->
    <div class="settings-group">
      <h4 class="text-h4">Display Settings</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Theme</label>
          <select class="select-field">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Language</label>
          <select class="select-field">
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="ms">Bahasa Melayu</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Date Format</label>
          <select class="select-field">
            <option value="dd/mm/yyyy">DD/MM/YYYY</option>
            <option value="mm/dd/yyyy">MM/DD/YYYY</option>
            <option value="yyyy-mm-dd">YYYY-MM-DD</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Currency Display</label>
          <select class="select-field">
            <option value="sgd">SGD ($)</option>
            <option value="sgd-symbol">$ (Symbol only)</option>
            <option value="sgd-code">SGD (Code only)</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Keyboard Shortcuts -->
    <div class="settings-group">
      <h4 class="text-h4">Keyboard Shortcuts</h4>
      <div class="shortcut-grid">
        <div class="shortcut-item">
          <span class="shortcut-label">Command Palette</span>
          <kbd class="shortcut-key">Ctrl+K</kbd>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-label">Quick Search</span>
          <kbd class="shortcut-key">F3</kbd>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-label">Renewals</span>
          <kbd class="shortcut-key">F4</kbd>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-label">Redemptions</span>
          <kbd class="shortcut-key">F5</kbd>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### B. System Configuration Tab
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">System Configuration</h3>
  </div>
  <div class="space-y-6">
    <!-- Transaction Settings -->
    <div class="settings-group">
      <h4 class="text-h4">Transaction Settings</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Auto-save Drafts</label>
          <div class="toggle-switch">
            <input type="checkbox" id="auto-save" checked />
            <label for="auto-save"></label>
          </div>
          <div class="text-caption">Automatically save form data every 30 seconds</div>
        </div>
        <div class="form-group">
          <label class="form-label">Dual Staff Authentication</label>
          <div class="toggle-switch">
            <input type="checkbox" id="dual-auth" checked />
            <label for="dual-auth"></label>
          </div>
          <div class="text-caption">Require secondary staff code for sensitive operations</div>
        </div>
        <div class="form-group">
          <label class="form-label">Transaction Timeout (minutes)</label>
          <input class="input-field" type="number" min="5" max="60" value="15" />
        </div>
        <div class="form-group">
          <label class="form-label">Print Receipts Automatically</label>
          <div class="toggle-switch">
            <input type="checkbox" id="auto-print" checked />
            <label for="auto-print"></label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Security Settings -->
    <div class="settings-group">
      <h4 class="text-h4">Security Settings</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Session Timeout (minutes)</label>
          <input class="input-field" type="number" min="15" max="480" value="120" />
        </div>
        <div class="form-group">
          <label class="form-label">Password Complexity</label>
          <select class="select-field">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Audit Logging</label>
          <div class="toggle-switch">
            <input type="checkbox" id="audit-log" checked disabled />
            <label for="audit-log"></label>
          </div>
          <div class="text-caption">Required for compliance (cannot be disabled)</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### C. Notification Settings Tab
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Notification Settings</h3>
  </div>
  <div class="space-y-6">
    <!-- System Notifications -->
    <div class="settings-group">
      <h4 class="text-h4">System Notifications</h4>
      <div class="notification-settings">
        <div class="notification-item">
          <div class="notification-info">
            <span class="notification-label">Transaction Completed</span>
            <div class="text-caption">Show confirmation when transactions are processed</div>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" id="notif-transaction" checked />
            <label for="notif-transaction"></label>
          </div>
        </div>
        <div class="notification-item">
          <div class="notification-info">
            <span class="notification-label">Payment Validation Errors</span>
            <div class="text-caption">Alert when payment amounts don't match</div>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" id="notif-payment" checked />
            <label for="notif-payment"></label>
          </div>
        </div>
        <div class="notification-item">
          <div class="notification-info">
            <span class="notification-label">Session Timeout Warning</span>
            <div class="text-caption">Warn 5 minutes before session expires</div>
          </div>
          <div class="toggle-switch">
            <input type="checkbox" id="notif-timeout" checked />
            <label for="notif-timeout"></label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### D. Data & Privacy Tab
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Data & Privacy</h3>
  </div>
  <div class="space-y-6">
    <!-- Data Retention -->
    <div class="settings-group">
      <h4 class="text-h4">Data Retention</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Search History (days)</label>
          <input class="input-field" type="number" min="7" max="365" value="30" />
        </div>
        <div class="form-group">
          <label class="form-label">Draft Transactions (days)</label>
          <input class="input-field" type="number" min="1" max="30" value="7" />
        </div>
      </div>
    </div>
    
    <!-- Export & Backup -->
    <div class="settings-group">
      <h4 class="text-h4">Export & Backup</h4>
      <div class="export-controls">
        <button class="btn-secondary">Export User Settings</button>
        <button class="btn-secondary">Import Settings</button>
        <button class="btn-tertiary">Reset to Defaults</button>
      </div>
    </div>
  </div>
</div>
```

### 10. Help & Support (`/help`) - Documentation & Assistance

**Layout**: Searchable knowledge base with categorized content

**Primary Components**:

#### A. Search & Quick Access
```html
<div class="help-header">
  <div class="search-container">
    <div class="search-bar">
      <input class="search-input" 
             placeholder="Search for help articles, tutorials, or features..." />
      <div class="search-icon">🔍</div>
    </div>
  </div>
  
  <!-- Quick Access Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
    <div class="help-card">
      <div class="help-icon">🚀</div>
      <h4 class="card-title">Getting Started</h4>
      <p class="text-caption">Learn the basics of ValueMax Vampire</p>
    </div>
    <div class="help-card">
      <div class="help-icon">⌨️</div>
      <h4 class="card-title">Keyboard Shortcuts</h4>
      <p class="text-caption">Master efficient navigation</p>
    </div>
    <div class="help-card">
      <div class="help-icon">🔧</div>
      <h4 class="card-title">Troubleshooting</h4>
      <p class="text-caption">Common issues and solutions</p>
    </div>
  </div>
</div>
```

#### B. FAQ Section
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Frequently Asked Questions</h3>
  </div>
  <div class="faq-list">
    <div class="faq-item">
      <button class="faq-question">
        How do I renew multiple tickets at once?
        <span class="faq-toggle">+</span>
      </button>
      <div class="faq-answer">
        <p>Use the Combined Operations feature (F7) to process multiple renewals simultaneously...</p>
      </div>
    </div>
    <div class="faq-item">
      <button class="faq-question">
        What if a customer lost their pledge receipt?
        <span class="faq-toggle">+</span>
      </button>
      <div class="faq-answer">
        <p>Use the Lost Letter Reprinting feature (F6) to generate a replacement document...</p>
      </div>
    </div>
  </div>
</div>
```

#### C. Feature Documentation
```html
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Core Functions -->
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Core Functions</h3>
    </div>
    <div class="feature-list">
      <a href="#func-01" class="feature-item">
        <span class="feature-name">Ticket Renewals (F4)</span>
        <span class="feature-description">Process single or multiple ticket renewals</span>
      </a>
      <a href="#func-02" class="feature-item">
        <span class="feature-name">Ticket Redemptions (F5)</span>
        <span class="feature-description">Handle ticket redemption with verification</span>
      </a>
      <a href="#func-03" class="feature-item">
        <span class="feature-name">Universal Enquiry (F3)</span>
        <span class="feature-description">Search customers, tickets, and transactions</span>
      </a>
    </div>
  </div>
  
  <!-- Advanced Features -->
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Advanced Features</h3>
    </div>
    <div class="feature-list">
      <a href="#func-06" class="feature-item">
        <span class="feature-name">Combined Operations (F7)</span>
        <span class="feature-description">Multi-step wizard for complex transactions</span>
      </a>
      <a href="#func-07" class="feature-item">
        <span class="feature-name">Credit Rating Assessment</span>
        <span class="feature-description">Evaluate customer creditworthiness</span>
      </a>
    </div>
  </div>
</div>
```

#### D. Contact & Support
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Need More Help?</h3>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="contact-method">
      <div class="contact-icon">📞</div>
      <h4 class="contact-title">Phone Support</h4>
      <p class="contact-details">+65 6xxx xxxx</p>
      <p class="text-caption">Mon-Fri, 9AM-6PM</p>
    </div>
    <div class="contact-method">
      <div class="contact-icon">📧</div>
      <h4 class="contact-title">Email Support</h4>
      <p class="contact-details">support@valuemax.com.sg</p>
      <p class="text-caption">Response within 24 hours</p>
    </div>
  </div>
  
  <!-- System Information -->
  <div class="system-info mt-6 pt-6 border-t">
    <h4 class="text-h4 mb-4">System Information</h4>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span class="text-caption">Version:</span>
        <span class="font-mono">v1.0.0</span>
      </div>
      <div>
        <span class="text-caption">Build:</span>
        <span class="font-mono">2025.07.14</span>
      </div>
      <div>
        <span class="text-caption">Environment:</span>
        <span class="font-mono">Production</span>
      </div>
      <div>
        <span class="text-caption">Browser:</span>
        <span class="font-mono" id="browser-info">Chrome 127</span>
      </div>
    </div>
  </div>
</div>
```

---

## Command Palette Integration

### Global Access
- **Primary**: `Ctrl+K` / `Cmd+K`
- **Secondary**: `/` key

### Smart Search Patterns
```typescript
const searchPatterns = {
  nric: /^[STFG]\d{7}[A-Z]$/,           // S1234567A
  ticket: /^[BST]\/\d{4}\/\d{4}$/,       // B/0725/1234
  phone: /^[6-9]\d{7}$/,                 // 91234567
  receipt: /^RCP\d{8}$/                  // RCP20250714
}
```

### Quick Actions
```typescript
const quickCommands = [
  { cmd: 'qr B/0725/1234', action: 'Quick Renew Ticket' },
  { cmd: 'qe B/0725/1234', action: 'Quick Redeem Ticket' },
  { cmd: 'lost B/0725/1234', action: 'Report Lost Pledge' },
  { cmd: 'print RCP20250714', action: 'Reprint Lost Letter' },
  { cmd: 'credit S1234567A', action: 'View Credit Rating' }
]
```

### Command Palette Styling
```css
.command-palette {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  max-width: 640px;
  margin: 0 auto;
}

.command-item:hover {
  background: var(--color-surface);
}

.command-item.active {
  background: var(--color-brand-red);
  color: white;
}
```

---

## Keyboard Navigation

### Global Shortcuts
| Key | Function | Description |
|-----|----------|-------------|
| `Ctrl+K` | Command Palette | Universal search and commands |
| `F1` | Help | Context-sensitive help |
| `F3` | Search | Go to enquiry system |
| `F4` | Renewals | Quick access to renewals |
| `F5` | Redemptions | Quick access to redemptions |
| `F6` | Lost Letters | Quick access to lost letter reprinting |
| `F7` | Combined Ops | Quick access to combined operations |
| `F12` | Settings | System settings and configuration |
| `Esc` | Cancel | Cancel current action |
| `Enter` | Confirm | Execute primary action |
| `Tab` | Navigate | Move between form fields |

### Form Navigation
- **Auto-focus**: First input field on page load
- **Enter**: Submit form or trigger lookup
- **Tab**: Logical field progression
- **Escape**: Clear form or return to previous state

### Accessibility Compliance
```css
.focus-visible {
  outline: 2px solid var(--color-brand-red);
  outline-offset: 2px;
}

/* Screen reader support */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  /* ... accessibility properties */
}
```

---

## Responsive Design Guidelines

### Breakpoints (Mobile-First)
```css
/* Mobile: 0px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px - 1439px */
/* Large: 1440px+ */

@media (max-width: 1024px) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 70px auto 1fr;
    grid-template-areas: 
      "header"
      "sidebar"
      "main";
  }
  
  .app-sidebar {
    display: none; /* Hidden on mobile, show via toggle */
  }
}
```

### Mobile Adaptations
- **Sidebar**: Collapsible overlay on mobile
- **Forms**: Single-column layout on small screens
- **Tables**: Horizontal scroll with sticky headers
- **Command Palette**: Full-screen on mobile

---

## Component Usage Standards

### Form Components
```html
<!-- Standard Form Group -->
<div class="form-group">
  <label class="form-label required">Field Name</label>
  <input class="input-field" type="text" required />
  <div class="text-caption">Helper text</div>
</div>

<!-- Monetary Input -->
<div class="form-group">
  <label class="form-label">Amount</label>
  <input class="input-field monetary-value" type="number" step="0.01" />
</div>

<!-- Ticket Number Input -->
<div class="form-group">
  <label class="form-label required">Ticket Number</label>
  <input class="input-field text-mono" 
         placeholder="B/MMYY/XXXX" 
         pattern="[BST]/\d{4}/\d{4}" />
</div>
```

### Status Indicators
```html
<!-- Ticket Status -->
<span class="status-badge status-active">Active</span>
<span class="status-badge status-pending">Pending</span>
<span class="status-badge status-completed">Completed</span>
<span class="status-badge status-error">Error</span>
<span class="status-badge status-redeemed">Redeemed</span>
```

### Data Tables
```html
<table class="data-table">
  <thead>
    <tr>
      <th>Time</th>
      <th>Ticket #</th>
      <th>Amount</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>14:23</td>
      <td class="text-mono">B/0725/1234</td>
      <td class="monetary-value">$245.00</td>
      <td><span class="status-badge status-completed">Completed</span></td>
    </tr>
  </tbody>
</table>
```

### Button Groups
```html
<div class="flex gap-4 justify-end">
  <button class="btn-tertiary">Cancel</button>
  <button class="btn-secondary">Save Draft</button>
  <button class="btn-primary">Confirm</button>
</div>
```

---

## Performance & Animation Guidelines

### Loading States
```css
.loading-skeleton {
  background: linear-gradient(90deg, 
    var(--color-muted) 0%, 
    var(--color-border) 50%, 
    var(--color-muted) 100%);
  animation: shimmer 2s infinite;
}
```

### Transition Standards
```css
/* Button interactions */
.btn:hover {
  transform: translateY(-1px);
  transition: transform var(--duration-fast) var(--easing-ease-out);
}

/* Card hover effects */
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  transition: all var(--duration-fast) var(--easing-ease-out);
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Notes

### Design Token Integration
All components must use design tokens from `src/design-tokens.ts`:
```typescript
export const designTokens = {
  colors: {
    brand: { red: '#8B1538', gold: '#F59E0B' },
    semantic: { success: '#10B981', error: '#EF4444' }
  },
  spacing: { /* 8px system */ },
  typography: { /* Inter font stack */ }
}
```

### Component Library Compliance
- **Exclusive Use**: Only shadcn/ui components
- **Custom Variants**: Extend via className, not custom components
- **Backward Compatibility**: Wrapper components for legacy integration

### Testing Considerations
- **Keyboard Navigation**: All functions accessible via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Logical tab order and focus indicators
- **Performance**: < 2s page load, < 100ms keyboard response

---

**Document Version**: 1.0  
**Created**: July 14, 2025  
**Based On**: ValueMax Vampire Frontend BRD v1.0 & Design System v1.0  
**Compliance**: shadcn/ui + Design Token Architecture  
**Review Cycle**: Sprint-based updates

---

*This specification ensures complete alignment with ValueMax business requirements while maintaining modern web standards and accessibility compliance.*