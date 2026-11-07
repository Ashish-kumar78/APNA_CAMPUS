import {
  Home,
  GraduationCap,
  Building2,
  Receipt,
  BookOpen,
  AlertTriangle,
  Clock,
  DollarSign,
  RotateCcw,
  ShieldCheck,
  Truck,
  Layers,
  TrendingUp,
  FileText,
  CreditCard
} from 'lucide-react';

/**
 * Accounts & Finance Role Menu Configuration
 */
export const getAccountsMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ]
  },
  {
    title: 'STUDENT FEES & RECEIPTS',
    items: [
      { id: 'fee_management', label: 'Student Fee Demand & Cohorts', icon: GraduationCap },
      { id: 'fee_structure', label: 'Fee Structure & Head Master', icon: Building2 },
      { id: 'fee_collection', label: 'Fee Collection Counter', icon: Receipt },
      { id: 'fee_ledger', label: 'Student Fee Ledger', icon: BookOpen },
      { id: 'fee_outstanding', label: 'Outstanding Dues & Defaulters', icon: AlertTriangle },
      { id: 'fee_installments', label: 'Installment Policies & Milestones', icon: Clock },
      { id: 'fee_scholarships', label: 'Scholarships & Approved Waivers', icon: DollarSign },
      { id: 'fee_refunds', label: 'Refunds & Receipt Reversals', icon: RotateCcw },
      { id: 'fee_clearance', label: 'Financial Clearance & Dues', icon: ShieldCheck }
    ]
  },
  {
    title: 'C. INCOME & OTHER RECEIPTS',
    items: [
      { id: 'receipt_register', label: 'Fee Receipt Register & Online', icon: Receipt },
      { id: 'income_other', label: 'Other College Auxiliary Revenue', icon: DollarSign },
      { id: 'income_hostel', label: 'Hostel & Mess Boarding Revenue', icon: Building2 },
      { id: 'income_transport', label: 'Campus Bus Transit Fees', icon: Truck },
      { id: 'income_exam', label: 'Examination Cell & Library Charges', icon: Layers }
    ]
  },
  {
    title: 'D. EXPENSES & PROCUREMENT',
    items: [
      { id: 'expense_register', label: 'Operating Expense Register', icon: TrendingUp },
      { id: 'vendor_management', label: 'Vendor Directory', icon: Building2 },
      { id: 'vendor_bills', label: 'Purchase Orders & Vendor Bills', icon: FileText },
      { id: 'vendor_payments', label: 'Supplier Payments & Tracking', icon: CreditCard },
      { id: 'expense_approvals', label: 'Procurement Approval Queue', icon: ShieldCheck },
      { id: 'payroll_advances', label: 'Staff Advances & Reimbursements', icon: TrendingUp }
    ]
  }
];

export default getAccountsMenuConfig;

