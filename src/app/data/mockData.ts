import { Department, DepartmentRoutingRule, Tag, User, Ticket, Comment, Attachment, KnowledgeBaseArticle, Customer, TimeEntry, ActivityLog, SLA, WorkflowRule, CannedResponse, SavedFilter, AuditLogEntry, Category } from '../types';

export const departments: Department[] = [
  { id: '1', name: 'Technical Support', color: '#3b82f6', description: 'Handles all technical issues, bugs, and system errors', managerId: '1', isActive: true },
  { id: '2', name: 'Billing', color: '#10b981', description: 'Manages invoices, payments, refunds, and subscription changes', managerId: '3', isActive: true },
  { id: '3', name: 'Sales', color: '#f59e0b', description: 'Handles pre-sales inquiries, demos, and enterprise proposals', managerId: '4', isActive: true },
  { id: '4', name: 'Customer Success', color: '#8b5cf6', description: 'Onboarding, training, account management, and retention', managerId: '5', isActive: true },
  { id: '5', name: 'Product', color: '#ec4899', description: 'Feature requests, product feedback, and roadmap items', isActive: true },
  { id: '6', name: 'Security', color: '#ef4444', description: 'Security vulnerabilities, compliance, and access control issues', isActive: false },
];

export const categories: Category[] = [
  { id: 'CAT-001', name: 'Technical Issue', color: '#ef4444', description: 'Bugs, errors, and system malfunctions', isActive: true, types: [
    { id: 'CT-001', name: 'Bug' },
    { id: 'CT-002', name: 'Crash' },
    { id: 'CT-003', name: 'Configuration Error' },
    { id: 'CT-004', name: 'Data Loss' },
    { id: 'CT-005', name: 'Connectivity' },
  ]},
  { id: 'CAT-002', name: 'Billing Issue', color: '#10b981', description: 'Invoice disputes, payment errors, and refunds', isActive: true, types: [
    { id: 'CT-006', name: 'Invoice Error' },
    { id: 'CT-007', name: 'Refund Request' },
    { id: 'CT-008', name: 'Subscription Change' },
    { id: 'CT-009', name: 'Overcharge' },
  ]},
  { id: 'CAT-003', name: 'Feature Request', color: '#3b82f6', description: 'New feature suggestions and enhancements', isActive: true, types: [
    { id: 'CT-010', name: 'New Feature' },
    { id: 'CT-011', name: 'Enhancement' },
    { id: 'CT-012', name: 'Integration Request' },
    { id: 'CT-013', name: 'UI/UX Improvement' },
  ]},
  { id: 'CAT-004', name: 'Sales Inquiry', color: '#f59e0b', description: 'Pre-sales questions, demos, and pricing', isActive: true, types: [
    { id: 'CT-014', name: 'Pricing Question' },
    { id: 'CT-015', name: 'Demo Request' },
    { id: 'CT-016', name: 'Enterprise Proposal' },
    { id: 'CT-017', name: 'Partnership' },
  ]},
  { id: 'CAT-005', name: 'Documentation', color: '#8b5cf6', description: 'Docs updates, guides, and how-to articles', isActive: true, types: [
    { id: 'CT-018', name: 'Missing Documentation' },
    { id: 'CT-019', name: 'Outdated Content' },
    { id: 'CT-020', name: 'How-To Guide' },
    { id: 'CT-021', name: 'API Reference' },
  ]},
  { id: 'CAT-006', name: 'Performance', color: '#ec4899', description: 'Slow loading, timeouts, and optimization', isActive: true, types: [
    { id: 'CT-022', name: 'Slow Loading' },
    { id: 'CT-023', name: 'Timeout' },
    { id: 'CT-024', name: 'Memory Usage' },
    { id: 'CT-025', name: 'Scalability' },
  ]},
  { id: 'CAT-007', name: 'Security', color: '#dc2626', description: 'Vulnerabilities, compliance, and access control', isActive: true, types: [
    { id: 'CT-026', name: 'Vulnerability Report' },
    { id: 'CT-027', name: 'Access Control' },
    { id: 'CT-028', name: 'Compliance' },
    { id: 'CT-029', name: 'Data Privacy' },
  ]},
  { id: 'CAT-008', name: 'Bug Report', color: '#f97316', description: 'Confirmed bugs with reproduction steps', isActive: true, types: [
    { id: 'CT-030', name: 'Reproducible Bug' },
    { id: 'CT-031', name: 'Intermittent Bug' },
    { id: 'CT-032', name: 'Regression' },
  ]},
  { id: 'CAT-009', name: 'Payment', color: '#14b8a6', description: 'Payment processing and transaction issues', isActive: true, types: [
    { id: 'CT-033', name: 'Failed Transaction' },
    { id: 'CT-034', name: 'Duplicate Charge' },
    { id: 'CT-035', name: 'Payment Method' },
  ]},
  { id: 'CAT-010', name: 'Pre-sales', color: '#a855f7', description: 'Evaluation and pre-purchase questions', isActive: true, types: [
    { id: 'CT-036', name: 'Product Evaluation' },
    { id: 'CT-037', name: 'Trial Extension' },
    { id: 'CT-038', name: 'Comparison' },
  ]},
  { id: 'CAT-011', name: 'Onboarding', color: '#06b6d4', description: 'New customer setup and getting started', isActive: true, types: [
    { id: 'CT-039', name: 'Account Setup' },
    { id: 'CT-040', name: 'Data Migration' },
    { id: 'CT-041', name: 'Initial Configuration' },
  ]},
  { id: 'CAT-012', name: 'Training', color: '#84cc16', description: 'Product training and knowledge transfer', isActive: true, types: [
    { id: 'CT-042', name: 'Live Training' },
    { id: 'CT-043', name: 'Self-Paced Course' },
    { id: 'CT-044', name: 'Certification' },
  ]},
  { id: 'CAT-013', name: 'General Inquiry', color: '#6b7280', description: 'General questions and miscellaneous', isActive: true, types: [
    { id: 'CT-045', name: 'General Question' },
    { id: 'CT-046', name: 'Feedback' },
    { id: 'CT-047', name: 'Other' },
  ]},
];

export const departmentRoutingRules: DepartmentRoutingRule[] = [
  {
    id: 'DR-001',
    name: 'Route bugs to Technical Support',
    departmentId: '1',
    isActive: true,
    priority: 1,
    conditions: {
      keywords: ['bug', 'error', 'crash', 'not working', 'broken', '500', '404', 'exception', 'stack trace'],
      categories: ['Technical Issue', 'Bug Report'],
    },
  },
  {
    id: 'DR-002',
    name: 'Route billing issues to Billing',
    departmentId: '2',
    isActive: true,
    priority: 2,
    conditions: {
      keywords: ['invoice', 'billing', 'payment', 'charge', 'refund', 'subscription', 'pricing', 'receipt', 'credit card'],
      categories: ['Billing Issue', 'Payment'],
    },
  },
  {
    id: 'DR-003',
    name: 'Route sales inquiries to Sales',
    departmentId: '3',
    isActive: true,
    priority: 3,
    conditions: {
      keywords: ['pricing', 'demo', 'enterprise', 'upgrade', 'plan', 'quote', 'proposal', 'trial'],
      categories: ['Sales Inquiry', 'Pre-sales'],
    },
  },
  {
    id: 'DR-004',
    name: 'Route feature requests to Product',
    departmentId: '5',
    isActive: true,
    priority: 4,
    conditions: {
      keywords: ['feature request', 'enhancement', 'suggestion', 'wishlist', 'roadmap', 'improvement'],
      categories: ['Feature Request'],
      tags: ['2'], // Feature Request tag
    },
  },
  {
    id: 'DR-005',
    name: 'Route security issues with high priority',
    departmentId: '1',
    isActive: true,
    priority: 0, // highest priority rule
    conditions: {
      keywords: ['security', 'vulnerability', 'breach', 'hack', 'unauthorized', 'exploit', 'CVE'],
      categories: ['Security'],
      tags: ['6'], // Security tag
    },
    autoAssignTo: '1', // auto-assign to senior agent
  },
  {
    id: 'DR-006',
    name: 'Route onboarding to Customer Success',
    departmentId: '4',
    isActive: true,
    priority: 5,
    conditions: {
      keywords: ['onboarding', 'training', 'getting started', 'setup help', 'walkthrough'],
      categories: ['Onboarding', 'Training'],
    },
  },
  {
    id: 'DR-007',
    name: 'Enterprise clients to Sales',
    departmentId: '3',
    isActive: true,
    priority: 1,
    conditions: {
      emailDomains: ['acmecorp.com', 'bigenterprise.com', 'fortune500.io'],
      priorityLevels: ['high', 'urgent'],
    },
  },
  {
    id: 'DR-008',
    name: 'Urgent tickets to Technical Support',
    departmentId: '1',
    isActive: true,
    priority: 2,
    conditions: {
      priorityLevels: ['urgent'],
    },
    autoAssignTo: '1',
  },
];

export const tags: Tag[] = [
  { id: '1', name: 'Bug', color: '#ef4444' },
  { id: '2', name: 'Feature Request', color: '#3b82f6' },
  { id: '3', name: 'Documentation', color: '#10b981' },
  { id: '4', name: 'Integration', color: '#f59e0b' },
  { id: '5', name: 'Performance', color: '#8b5cf6' },
  { id: '6', name: 'Security', color: '#ec4899' },
];

export const users: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@company.com', department: '1', role: 'admin', status: 'online', departments: ['1', '2', '3', '4', '5'] },
  { id: '2', name: 'Mike Chen', email: 'mike.c@company.com', department: '1', role: 'agent', status: 'busy', departments: ['1'], customPermissions: { grants: ['view_reports'] } },
  { id: '3', name: 'Emily Davis', email: 'emily.d@company.com', department: '2', role: 'manager', status: 'offline', departments: ['2'], customPermissions: { grants: ['view_audit_log'] } },
  { id: '4', name: 'James Wilson', email: 'james.w@company.com', department: '3', role: 'agent', status: 'online', departments: ['3'] },
  { id: '5', name: 'Lisa Anderson', email: 'lisa.a@company.com', department: '4', role: 'manager', status: 'online', departments: ['4', '5'] },
  { id: '6', name: 'Tom Roberts', email: 'tom.r@company.com', department: '1', role: 'agent', status: 'online', departments: ['1'] },
  { id: '7', name: 'Anna Kim', email: 'anna.k@company.com', department: '2', role: 'agent', status: 'busy', departments: ['2'] },
  { id: '8', name: 'David Martinez', email: 'david.m@company.com', department: '5', role: 'viewer', status: 'online', departments: ['5'], customPermissions: { grants: ['view_reports'] } },
];

export const tickets: Ticket[] = [
  {
    id: 'TCK-1001',
    subject: 'Login page not loading correctly',
    description: 'Users are reporting that the login page shows a blank screen when accessing from mobile devices. This appears to be affecting iOS users primarily.',
    status: 'open',
    priority: 'high',
    departmentId: '1',
    assignedTo: '1',
    createdBy: '4',
    createdAt: '2026-02-24T09:15:00Z',
    updatedAt: '2026-02-24T09:15:00Z',
    tags: ['1', '5'],
    category: 'Technical Issue',
  },
  {
    id: 'TCK-1002',
    subject: 'Invoice discrepancy for February billing',
    description: 'Customer reports being charged twice for the premium subscription in February. Need to verify billing records and process refund.',
    status: 'in-progress',
    priority: 'urgent',
    departmentId: '2',
    assignedTo: '3',
    createdBy: '4',
    createdAt: '2026-02-23T14:30:00Z',
    updatedAt: '2026-02-24T10:00:00Z',
    tags: [],
    category: 'Billing Issue',
  },
  {
    id: 'TCK-1003',
    subject: 'Request for API documentation update',
    description: 'Need to update the webhook integration documentation to include the new event types added in version 2.3.',
    status: 'pending',
    priority: 'medium',
    departmentId: '1',
    assignedTo: '2',
    createdBy: '5',
    createdAt: '2026-02-22T11:00:00Z',
    updatedAt: '2026-02-23T16:20:00Z',
    tags: ['3', '4'],
    category: 'Documentation',
  },
  {
    id: 'TCK-1004',
    subject: 'Enterprise plan upgrade inquiry',
    description: 'Potential customer wants to know about enterprise plan features, pricing, and implementation timeline. They have 500+ users.',
    status: 'in-progress',
    priority: 'high',
    departmentId: '3',
    assignedTo: '4',
    createdBy: '1',
    createdAt: '2026-02-21T15:45:00Z',
    updatedAt: '2026-02-24T08:30:00Z',
    tags: [],
    category: 'Sales Inquiry',
  },
  {
    id: 'TCK-1005',
    subject: 'Data export feature not working',
    description: 'When trying to export data to CSV, the download starts but the file is corrupted. Tested on Chrome and Firefox with the same result.',
    status: 'resolved',
    priority: 'medium',
    departmentId: '1',
    assignedTo: '1',
    createdBy: '5',
    createdAt: '2026-02-20T10:20:00Z',
    updatedAt: '2026-02-23T14:00:00Z',
    tags: ['1'],
    category: 'Technical Issue',
    closedAt: '2026-02-23T14:00:00Z',
    closedBy: '1',
    resolutionNotes: 'Fixed encoding issue in the export function. Deployed patch v2.3.1',
  },
  {
    id: 'TCK-1006',
    subject: 'Request for SSO integration with Okta',
    description: 'Customer needs SAML-based SSO integration with their Okta identity provider for seamless authentication.',
    status: 'open',
    priority: 'medium',
    departmentId: '1',
    assignedTo: '2',
    createdBy: '4',
    createdAt: '2026-02-24T13:00:00Z',
    updatedAt: '2026-02-24T13:00:00Z',
    tags: ['2', '4', '6'],
    category: 'Feature Request',
  },
  {
    id: 'TCK-1007',
    subject: 'Slow dashboard loading times',
    description: 'Dashboard takes more than 10 seconds to load. User has over 1000 records which might be causing the performance issue.',
    status: 'in-progress',
    priority: 'high',
    departmentId: '1',
    assignedTo: '1',
    createdBy: '5',
    createdAt: '2026-02-19T09:30:00Z',
    updatedAt: '2026-02-24T11:15:00Z',
    tags: ['5'],
    category: 'Performance',
  },
  {
    id: 'TCK-1008',
    subject: 'Cannot access account after password reset',
    description: 'User reset password but verification email is not arriving. Checked spam folder with no results.',
    status: 'closed',
    priority: 'urgent',
    departmentId: '1',
    assignedTo: '2',
    createdBy: '4',
    createdAt: '2026-02-18T16:00:00Z',
    updatedAt: '2026-02-19T09:00:00Z',
    tags: ['1', '6'],
    category: 'Technical Issue',
    closedAt: '2026-02-19T09:00:00Z',
    closedBy: '2',
    resolutionNotes: 'Email was being blocked by corporate firewall. Worked with IT team to whitelist our domain.',
  },
  {
    id: 'TCK-1010',
    subject: 'Request for API rate limit increase',
    description: 'Our application is hitting the API rate limit. We need to increase it to 10,000 requests per hour.',
    status: 'pending',
    priority: 'medium',
    departmentId: '1',
    assignedTo: '1',
    createdBy: '1',
    createdAt: '2026-02-22T14:00:00Z',
    updatedAt: '2026-02-24T09:00:00Z',
    tags: ['1'],
    category: 'Feature Request',
  },
];

// Add some tickets with enhanced features
tickets.push(
  {
    id: 'TCK-1011',
    subject: 'Website down - urgent!',
    description: 'Main website is completely down. Getting 500 errors.',
    status: 'in-progress',
    priority: 'urgent',
    departmentId: '1',
    assignedTo: '1',
    createdBy: '1',
    customerId: 'CUST-001',
    createdAt: '2026-02-25T08:30:00Z',
    updatedAt: '2026-02-25T08:45:00Z',
    tags: ['1', '3'],
    dueDate: '2026-02-25T12:00:00Z',
    firstResponseAt: '2026-02-25T08:35:00Z',
    slaStatus: 'at-risk',
    customFields: {
      customerType: 'enterprise',
      impact: 'critical',
    },
  },
  {
    id: 'TCK-1012',
    subject: 'Invoice discrepancy',
    description: 'We were charged twice for the same invoice #12345.',
    status: 'open',
    priority: 'high',
    departmentId: '2',
    createdBy: '1',
    customerId: 'CUST-002',
    createdAt: '2026-02-25T10:00:00Z',
    updatedAt: '2026-02-25T10:00:00Z',
    tags: ['2'],
    dueDate: '2026-02-27T10:00:00Z',
    slaStatus: 'met',
    customFields: {
      customerType: 'business',
      impact: 'high',
    },
  }
);

export const comments: Comment[] = [
  {
    id: '1',
    ticketId: 'TCK-1001',
    userId: '1',
    content: 'I\'m looking into this issue. It seems to be related to the recent CSS update. Investigating now.',
    createdAt: '2026-02-24T09:30:00Z',
    isInternal: true,
  },
  {
    id: '2',
    ticketId: 'TCK-1002',
    userId: '3',
    content: 'Confirmed the double charge. Processing refund now. Should appear in 3-5 business days.',
    createdAt: '2026-02-24T10:00:00Z',
    isInternal: false,
  },
  {
    id: '3',
    ticketId: 'TCK-1003',
    userId: '2',
    content: 'Waiting for product team to finalize the event type specifications before updating documentation.',
    createdAt: '2026-02-23T16:20:00Z',
    isInternal: true,
  },
  {
    id: '4',
    ticketId: 'TCK-1004',
    userId: '4',
    content: 'Sent pricing proposal and demo link. Scheduling call for next week to discuss implementation.',
    createdAt: '2026-02-24T08:30:00Z',
    isInternal: false,
  },
];

export const attachments: Attachment[] = [
  {
    id: '1',
    ticketId: 'TCK-1001',
    name: 'screenshot-mobile-error.png',
    size: 245678,
    url: '#',
    uploadedBy: '4',
    uploadedAt: '2026-02-24T09:15:00Z',
  },
  {
    id: '2',
    ticketId: 'TCK-1002',
    name: 'invoice-february.pdf',
    size: 89234,
    url: '#',
    uploadedBy: '4',
    uploadedAt: '2026-02-23T14:30:00Z',
  },
];

export const knowledgeBase: KnowledgeBaseArticle[] = [
  {
    id: 'KB-001',
    title: 'How to Fix Data Export Issues',
    content: `# Data Export Troubleshooting

If you're experiencing issues with data export:

1. **Check File Format**: Ensure you've selected the correct format (CSV, Excel, PDF)
2. **Browser Compatibility**: Use the latest version of Chrome, Firefox, or Safari
3. **Clear Cache**: Sometimes cached data can cause corruption
4. **File Size**: Large exports (>10MB) may take longer to process

## Common Solutions

### Corrupted File
If your downloaded file is corrupted, try:
- Disabling browser extensions
- Using a different browser
- Reducing the date range of your export

### Solution Implemented
As of version 2.3.1, we've fixed the encoding issue that was causing CSV corruption.`,
    ticketId: 'TCK-1005',
    departmentId: '1',
    tags: ['1', '3'],
    createdBy: '1',
    createdAt: '2026-02-23T15:00:00Z',
    updatedAt: '2026-02-23T15:00:00Z',
    views: 42,
  },
  {
    id: 'KB-002',
    title: 'Password Reset Email Not Received',
    content: `# Password Reset Email Issues

If you're not receiving password reset emails:

## Check These First
1. **Spam/Junk Folder**: Check your spam folder
2. **Email Address**: Verify you're using the correct email
3. **Firewall**: Corporate firewalls may block our emails

## For IT Administrators
Whitelist these domains:
- @yourcompany.com
- noreply@yourcompany.com

## Still Having Issues?
Contact support at support@company.com`,
    ticketId: 'TCK-1008',
    departmentId: '1',
    tags: ['6', '3'],
    createdBy: '2',
    createdAt: '2026-02-19T10:00:00Z',
    updatedAt: '2026-02-19T10:00:00Z',
    views: 128,
  },
];

export const customers: Customer[] = [
  { id: 'CUST-001', name: 'John Doe', email: 'john.doe@acmecorp.com', company: 'Acme Corp', phone: '+1-555-0101', createdAt: '2025-12-01T00:00:00Z', totalTickets: 5, satisfactionScore: 4.5 },
  { id: 'CUST-002', name: 'Jane Smith', email: 'jane.smith@techstart.io', company: 'TechStart', phone: '+1-555-0102', createdAt: '2025-11-15T00:00:00Z', totalTickets: 3, satisfactionScore: 5.0 },
  { id: 'CUST-003', name: 'Bob Johnson', email: 'bob@example.com', createdAt: '2026-01-10T00:00:00Z', totalTickets: 2 },
];

export const timeEntries: TimeEntry[] = [
  { id: 'TIME-001', ticketId: 'TCK-1001', userId: '1', hours: 2.5, description: 'Investigated mobile CSS issues', createdAt: '2026-02-24T11:00:00Z' },
  { id: 'TIME-002', ticketId: 'TCK-1002', userId: '3', hours: 1.0, description: 'Processed refund and verified billing', createdAt: '2026-02-24T10:30:00Z' },
  { id: 'TIME-003', ticketId: 'TCK-1007', userId: '1', hours: 4.0, description: 'Performance optimization testing', createdAt: '2026-02-24T14:00:00Z' },
];

export const activityLogs: ActivityLog[] = [
  { id: 'ACT-001', ticketId: 'TCK-1001', userId: '1', action: 'Ticket created', createdAt: '2026-02-24T09:15:00Z' },
  { id: 'ACT-002', ticketId: 'TCK-1001', userId: '1', action: 'Assigned to Sarah Johnson', createdAt: '2026-02-24T09:16:00Z' },
  { id: 'ACT-003', ticketId: 'TCK-1001', userId: '1', action: 'Added internal note', createdAt: '2026-02-24T09:30:00Z' },
  { id: 'ACT-004', ticketId: 'TCK-1002', userId: '3', action: 'Status changed', changes: { status: { from: 'open', to: 'in-progress' } }, createdAt: '2026-02-23T15:00:00Z' },
  { id: 'ACT-005', ticketId: 'TCK-1002', userId: '3', action: 'Added comment', createdAt: '2026-02-24T10:00:00Z' },
];

export const slas: SLA[] = [
  { id: 'SLA-001', name: 'Urgent Response SLA', priority: 'urgent', firstResponseTime: 1, resolutionTime: 4, isActive: true },
  { id: 'SLA-002', name: 'High Priority SLA', priority: 'high', firstResponseTime: 4, resolutionTime: 24, isActive: true },
  { id: 'SLA-003', name: 'Standard SLA', priority: 'medium', firstResponseTime: 8, resolutionTime: 48, isActive: true },
  { id: 'SLA-004', name: 'Low Priority SLA', priority: 'low', firstResponseTime: 24, resolutionTime: 120, isActive: true },
  { id: 'SLA-005', name: 'Technical Support SLA', departmentId: '1', firstResponseTime: 2, resolutionTime: 16, isActive: true },
];

export const workflowRules: WorkflowRule[] = [
  {
    id: 'WF-001',
    name: 'Auto-assign urgent tickets to senior support',
    isActive: true,
    trigger: 'ticket_created',
    conditions: { priority: 'urgent' },
    actions: { assignTo: '1', sendNotification: true }
  },
  {
    id: 'WF-002',
    name: 'Escalate high priority tickets after 12 hours',
    isActive: true,
    trigger: 'overdue',
    conditions: { priority: 'high', status: 'open' },
    actions: { changePriority: 'urgent', sendNotification: true }
  },
  {
    id: 'WF-003',
    name: 'Auto-tag billing department tickets',
    isActive: true,
    trigger: 'ticket_created',
    conditions: { departmentId: '2' },
    actions: { assignTo: '3' }
  },
];

export const cannedResponses: CannedResponse[] = [
  {
    id: 'CR-001',
    name: 'Welcome Message',
    subject: 'Thank you for contacting support',
    content: 'Hello,\n\nThank you for reaching out to our support team. We have received your ticket and will respond as soon as possible.\n\nBest regards,\nSupport Team',
    createdBy: '1',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'CR-002',
    name: 'Request More Information',
    content: 'Hello,\n\nTo help us resolve your issue more quickly, could you please provide:\n- Steps to reproduce the issue\n- Screenshots or error messages\n- Browser and operating system details\n\nThank you for your cooperation.',
    departmentId: '1',
    tags: ['1'],
    createdBy: '1',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'CR-003',
    name: 'Billing Inquiry Response',
    content: 'Hello,\n\nThank you for your billing inquiry. Our billing team is reviewing your account and will respond within 24 hours with a detailed explanation.\n\nIf this is urgent, please reply with "URGENT" and we\'ll prioritize your request.',
    departmentId: '2',
    createdBy: '3',
    createdAt: '2026-01-20T00:00:00Z'
  },
  {
    id: 'CR-004',
    name: 'Issue Resolved',
    content: 'Hello,\n\nWe\'re happy to inform you that your issue has been resolved. Please verify that everything is working as expected.\n\nIf you continue to experience issues, please let us know and we\'ll reopen this ticket.\n\nBest regards,\nSupport Team',
    createdBy: '1',
    createdAt: '2026-01-15T00:00:00Z'
  },
];

export const savedFilters: SavedFilter[] = [
  {
    id: 'SF-001',
    name: 'My Open Tickets',
    userId: '1',
    filters: { status: ['open', 'in-progress'], assignedTo: ['1'] },
    isDefault: true,
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'SF-002',
    name: 'Urgent Unassigned',
    userId: '1',
    filters: { priority: ['urgent'], assignedTo: [] },
    isShared: true,
    createdAt: '2026-02-16T10:00:00Z',
  },
  {
    id: 'SF-003',
    name: 'Technical Support Backlog',
    userId: '2',
    filters: { departmentId: ['1'], status: ['open', 'pending'] },
    isShared: true,
    createdAt: '2026-02-17T10:00:00Z',
  },
  {
    id: 'SF-004',
    name: 'Billing - High Priority',
    userId: '3',
    filters: { departmentId: ['2'], priority: ['high', 'urgent'] },
    isShared: false,
    createdAt: '2026-02-18T10:00:00Z',
  },
  {
    id: 'SF-005',
    name: 'All Closed This Month',
    userId: '1',
    filters: { status: ['closed', 'resolved'] },
    isShared: true,
    createdAt: '2026-02-20T10:00:00Z',
  },
];

export const auditLogEntries: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-02-20T09:00:00Z',
    actorId: '1',
    targetUserId: '2',
    action: 'role_changed',
    details: { from: 'viewer', to: 'agent', reason: 'Promoted after onboarding period' },
  },
  {
    id: 'AUD-002',
    timestamp: '2026-02-21T11:30:00Z',
    actorId: '1',
    targetUserId: '3',
    action: 'permissions_changed',
    details: { granted: ['view_audit_log'], revoked: [] },
  },
  {
    id: 'AUD-003',
    timestamp: '2026-02-22T14:15:00Z',
    actorId: '1',
    targetUserId: '8',
    action: 'permissions_changed',
    details: { granted: ['view_reports'], revoked: [] },
  },
  {
    id: 'AUD-004',
    timestamp: '2026-02-23T08:45:00Z',
    actorId: '1',
    targetUserId: '4',
    action: 'department_changed',
    details: { from: 'Billing', to: 'Sales' },
  },
  {
    id: 'AUD-005',
    timestamp: '2026-02-24T10:00:00Z',
    actorId: '1',
    action: 'department_created',
    details: { departmentName: 'Security', departmentId: '6' },
  },
  {
    id: 'AUD-006',
    timestamp: '2026-02-24T16:30:00Z',
    actorId: '1',
    action: 'routing_rule_created',
    details: { ruleName: 'Enterprise clients to Sales', ruleId: 'DR-007' },
  },
  {
    id: 'AUD-007',
    timestamp: '2026-02-25T09:00:00Z',
    actorId: '3',
    targetUserId: '7',
    action: 'role_changed',
    details: { from: 'viewer', to: 'agent', reason: 'Team expansion' },
  },
  {
    id: 'AUD-008',
    timestamp: '2026-02-25T14:20:00Z',
    actorId: '1',
    action: 'routing_rule_updated',
    details: { ruleName: 'Route bugs to Technical Support', ruleId: 'DR-001', changes: 'Added new keywords' },
  },
];