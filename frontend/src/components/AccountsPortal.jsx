import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from './Navigation';
import {
  Layers,
  GraduationCap,
  Building2,
  Receipt,
  CreditCard,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Users,
  Briefcase,
  FileText,
  Clock,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Download,
  Settings,
  Calendar,
  PieChart as PieIcon,
  BarChart2,
  HelpCircle,
  Hash,
  Truck,
  BookOpen,
  MessageSquare,
  PlusCircle,
  Search,
  Filter,
  Check,
  X,
  Printer
} from 'lucide-react';
import './AccountsPortal.css';
import './AccountsModules/AccountsPortalUtilities.css';
import CampusConnect from './CampusConnect/CampusConnect.jsx';

// Import Master Data & Initial State
import {
  ACCOUNTS_OFFICER,
  INITIAL_FEE_STRUCTURES,
  INITIAL_STUDENT_LEDGERS,
  INITIAL_TRANSACTIONS,
  INITIAL_PAYROLL_EMPLOYEES,
  INITIAL_VENDORS,
  INITIAL_VENDOR_BILLS,
  INITIAL_EXPENSES,
  INITIAL_OTHER_INCOME,
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_BANK_RECONCILIATION,
  INITIAL_BUDGETS,
  INITIAL_ACCOUNTS_AUDIT_LOGS
} from './AccountsModules/accountsData';

// Import Module Subtabs
import AccountsDashboardTab from './AccountsModules/AccountsDashboardTab';
import AccountsStudentFinanceTab from './AccountsModules/AccountsStudentFinanceTab';
import AccountsPayrollTab from './AccountsModules/AccountsPayrollTab';
import AccountsReceiptsIncomeTab from './AccountsModules/AccountsReceiptsIncomeTab';
import AccountsExpensesProcurementTab from './AccountsModules/AccountsExpensesProcurementTab';
import AccountsGeneralLedgerTab from './AccountsModules/AccountsGeneralLedgerTab';
import AccountsBudgetTab from './AccountsModules/AccountsBudgetTab';
import AccountsReportsTab from './AccountsModules/AccountsReportsTab';
import AccountsSettingsTab from './AccountsModules/AccountsSettingsTab';

export default function AccountsPortal({ account, onLogout }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (account?.initialTab) return account.initialTab;
    return 'dashboard';
  });

  // ──────────────────────────────────────────────────────────────────────────
  // LocalStorage Persistent State with Safe Fallbacks
  // ──────────────────────────────────────────────────────────────────────────
  const [feeStructures, setFeeStructures] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_fee_structures');
      return saved ? JSON.parse(saved) : INITIAL_FEE_STRUCTURES;
    } catch {
      return INITIAL_FEE_STRUCTURES;
    }
  });

  const [studentLedgers, setStudentLedgers] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_student_ledgers');
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_LEDGERS;
    } catch {
      return INITIAL_STUDENT_LEDGERS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [payrollEmployees, setPayrollEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_payroll_employees');
      return saved ? JSON.parse(saved) : INITIAL_PAYROLL_EMPLOYEES;
    } catch {
      return INITIAL_PAYROLL_EMPLOYEES;
    }
  });

  const [vendors, setVendors] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_vendors');
      return saved ? JSON.parse(saved) : INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  });

  const [vendorBills, setVendorBills] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_vendor_bills');
      return saved ? JSON.parse(saved) : INITIAL_VENDOR_BILLS;
    } catch {
      return INITIAL_VENDOR_BILLS;
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [otherIncome, setOtherIncome] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_other_income');
      return saved ? JSON.parse(saved) : INITIAL_OTHER_INCOME;
    } catch {
      return INITIAL_OTHER_INCOME;
    }
  });

  const [chartOfAccounts, setChartOfAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_chart_of_accounts');
      return saved ? JSON.parse(saved) : INITIAL_CHART_OF_ACCOUNTS;
    } catch {
      return INITIAL_CHART_OF_ACCOUNTS;
    }
  });

  const [journalEntries, setJournalEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_journal_entries');
      return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
    } catch {
      return INITIAL_JOURNAL_ENTRIES;
    }
  });

  const [bankReconciliations, setBankReconciliations] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_bank_reconciliations');
      return saved ? JSON.parse(saved) : INITIAL_BANK_RECONCILIATION;
    } catch {
      return INITIAL_BANK_RECONCILIATION;
    }
  });

  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_budgets');
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_accounts_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS_AUDIT_LOGS;
    } catch {
      return INITIAL_ACCOUNTS_AUDIT_LOGS;
    }
  });

  // Save to LocalStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_fee_structures', JSON.stringify(feeStructures));
    } catch {}
  }, [feeStructures]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_student_ledgers', JSON.stringify(studentLedgers));
    } catch {}
  }, [studentLedgers]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_transactions', JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_payroll_employees', JSON.stringify(payrollEmployees));
    } catch {}
  }, [payrollEmployees]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_vendors', JSON.stringify(vendors));
    } catch {}
  }, [vendors]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_vendor_bills', JSON.stringify(vendorBills));
    } catch {}
  }, [vendorBills]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_expenses', JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_other_income', JSON.stringify(otherIncome));
    } catch {}
  }, [otherIncome]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_chart_of_accounts', JSON.stringify(chartOfAccounts));
    } catch {}
  }, [chartOfAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_journal_entries', JSON.stringify(journalEntries));
    } catch {}
  }, [journalEntries]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_bank_reconciliations', JSON.stringify(bankReconciliations));
    } catch {}
  }, [bankReconciliations]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_budgets', JSON.stringify(budgets));
    } catch {}
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_accounts_audit_logs', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Helper: Append Audit Log Event
  const handleAddAuditLog = (event) => {
    const newLog = {
      id: `FIN-AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
      actor: ACCOUNTS_OFFICER.name,
      role: ACCOUNTS_OFFICER.designation,
      actionType: event.actionType || 'FINANCIAL_TRANSACTION_RECORDED',
      target: event.target || 'General Ledger Entry',
      details: event.details || 'Processed via central accounts command terminal.',
      ip: '192.168.1.14 (Accounts Desk 1)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper: Reset Demo Data
  const handleResetDemoData = () => {
    localStorage.removeItem('apna_accounts_fee_structures');
    localStorage.removeItem('apna_accounts_student_ledgers');
    localStorage.removeItem('apna_accounts_transactions');
    localStorage.removeItem('apna_accounts_payroll_employees');
    localStorage.removeItem('apna_accounts_vendors');
    localStorage.removeItem('apna_accounts_vendor_bills');
    localStorage.removeItem('apna_accounts_expenses');
    localStorage.removeItem('apna_accounts_other_income');
    localStorage.removeItem('apna_accounts_chart_of_accounts');
    localStorage.removeItem('apna_accounts_journal_entries');
    localStorage.removeItem('apna_accounts_bank_reconciliations');
    localStorage.removeItem('apna_accounts_budgets');
    localStorage.removeItem('apna_accounts_audit_logs');

    setFeeStructures(INITIAL_FEE_STRUCTURES);
    setStudentLedgers(INITIAL_STUDENT_LEDGERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setPayrollEmployees(INITIAL_PAYROLL_EMPLOYEES);
    setVendors(INITIAL_VENDORS);
    setVendorBills(INITIAL_VENDOR_BILLS);
    setExpenses(INITIAL_EXPENSES);
    setOtherIncome(INITIAL_OTHER_INCOME);
    setChartOfAccounts(INITIAL_CHART_OF_ACCOUNTS);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setBankReconciliations(INITIAL_BANK_RECONCILIATION);
    setBudgets(INITIAL_BUDGETS);
    setAuditLogs(INITIAL_ACCOUNTS_AUDIT_LOGS);

    setActiveTab('dashboard');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Exact 9 Collapsible Sidebar Groups (Section 4 of Master Prompt)
  // ──────────────────────────────────────────────────────────────────────────
  const accountsNavSections = useMemo(() => [
    {
      title: 'A. DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Finance Dashboard', icon: Layers }
      ]
    },
    {
      title: 'B. STUDENT FINANCE',
      items: [
        { id: 'fee_management', label: 'Student Fee Management', icon: GraduationCap },
        { id: 'fee_structure', label: 'Fee Structure Configuration', icon: Building2 },
        { id: 'fee_collection', label: 'Fee Collection Counter', icon: Receipt },
        { id: 'fee_ledger', label: 'Student Fee Ledger', icon: BookOpen },
        { id: 'fee_outstanding', label: 'Outstanding Dues & Defaulters', icon: AlertTriangle, badge: studentLedgers.filter(s => s.outstandingBalance > 0).length || undefined, badgeType: 'urgent' },
        { id: 'fee_installments', label: 'Installment Management', icon: Clock },
        { id: 'fee_scholarships', label: 'Scholarships & Concessions', icon: DollarSign },
        { id: 'fee_refunds', label: 'Refund Management', icon: RotateCcw },
        { id: 'fee_clearance', label: 'Student Financial Clearance', icon: ShieldCheck }
      ]
    },
    {
      title: 'C. PAYROLL & EMPLOYEE FINANCE',
      items: [
        { id: 'payroll_staff', label: 'Staff Payroll Directory', icon: Users },
        { id: 'payroll_teachers', label: 'Teacher Salary Management', icon: Briefcase },
        { id: 'payroll_processing', label: 'Monthly Payroll Processing', icon: CheckCircle2 },
        { id: 'payroll_payslips', label: 'Payslip Management', icon: FileText },
        { id: 'payroll_advances', label: 'Reimbursements & Advances', icon: TrendingUp }
      ]
    },
    {
      title: 'D. RECEIPTS & INCOME',
      items: [
        { id: 'receipt_register', label: 'Fee Receipt Register', icon: Receipt },
        { id: 'income_other', label: 'Other College Auxiliary Revenue', icon: DollarSign },
        { id: 'income_hostel', label: 'Hostel & Mess Boarding Fees', icon: Building2 },
        { id: 'income_transport', label: 'Campus Bus Transit Fees', icon: Truck },
        { id: 'income_exam', label: 'Examination Cell Fees', icon: Layers }
      ]
    },
    {
      title: 'E. EXPENSES & PROCUREMENT',
      items: [
        { id: 'expense_register', label: 'Operating Expense Register', icon: TrendingUp },
        { id: 'vendor_management', label: 'Vendor Directory', icon: Building2 },
        { id: 'vendor_bills', label: 'Vendor Bills & Invoices', icon: FileText, badge: vendorBills.filter(b => b.balance > 0).length || undefined, badgeType: 'warning' },
        { id: 'vendor_payments', label: 'Supplier Payments & Tracking', icon: CreditCard },
        { id: 'expense_approvals', label: 'Procurement Approval Queue', icon: ShieldCheck }
      ]
    },
    {
      title: 'F. ACCOUNTING',
      items: [
        { id: 'acc_chart_of_accounts', label: 'Chart of Accounts (COA)', icon: Layers },
        { id: 'acc_general_ledger', label: 'General Ledger Drilldown', icon: BookOpen },
        { id: 'acc_journal_entries', label: 'Double-Entry Journal Entries', icon: FileText },
        { id: 'acc_cash_book', label: 'Cash & Bank Books', icon: Landmark },
        { id: 'acc_receivable', label: 'Accounts Receivable (A/R)', icon: TrendingUp },
        { id: 'acc_payable', label: 'Accounts Payable (A/P)', icon: AlertTriangle },
        { id: 'acc_bank_reconciliation', label: 'Bank Reconciliation (BRS)', icon: ShieldCheck },
        { id: 'acc_period_closing', label: 'Financial Period Closing', icon: CheckCircle2 }
      ]
    },
    {
      title: 'G. BUDGET & FINANCIAL PLANNING',
      items: [
        { id: 'budget_annual', label: 'Annual Master Budget', icon: Layers },
        { id: 'budget_departments', label: 'Department Budgets', icon: Building2 },
        { id: 'budget_utilization', label: 'Budget Utilization & Variance', icon: TrendingUp }
      ]
    },
    {
      title: 'H. REPORTS & AUDIT',
      items: [
        { id: 'rep_fee_collection', label: 'Fee Collection Summary', icon: Receipt },
        { id: 'rep_outstanding_dues', label: 'Outstanding Arrears Report', icon: AlertTriangle },
        { id: 'rep_payroll', label: 'Monthly Payroll Statement', icon: Users },
        { id: 'rep_income_expenditure', label: 'Income & Expenditure Statement', icon: TrendingUp },
        { id: 'rep_trial_balance', label: 'Trial Balance Ledger', icon: BookOpen },
        { id: 'rep_audit_trail', label: 'Statutory Financial Audit Trail', icon: ShieldCheck },
        { id: 'campus-connect', label: 'Campus Connect Broadcast', icon: MessageSquare }
      ]
    },
    {
      title: 'I. CONFIGURATION',
      items: [
        { id: 'cfg_academic_year', label: 'Academic & Financial Periods', icon: Calendar },
        { id: 'cfg_fee_heads', label: 'Fee Heads & Late Rules', icon: Layers },
        { id: 'cfg_salary_components', label: 'Salary Components & Formulas', icon: Users },
        { id: 'cfg_numbering', label: 'Voucher Numbering Prefixes', icon: Hash },
        { id: 'cfg_payment_methods', label: 'Payment Channels & Gateways', icon: CreditCard },
        { id: 'cfg_approval_workflows', label: 'Approval Thresholds', icon: ShieldCheck },
        { id: 'cfg_reset_demo_data', label: 'Reset Demo Data', icon: RotateCcw }
      ]
    }
  ], [studentLedgers, vendorBills]);

  // Page Header Titles & Subtitles
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Accounts & Finance Command Center',
          subtitle: 'Institutional bursar operations, fee realizations, reconciliations, and executive fiscal oversight.'
        };
      case 'fee_management':
        return {
          title: 'Student Fee Management',
          subtitle: 'Institutional fee oversight, student cohort demand tracking, collection metrics, and batch actions.'
        };
      case 'fee_ledger':
        return {
          title: 'Student Fee Ledger',
          subtitle: 'Searchable database of student fee ledgers, payment histories, adjustments, and receipts.'
        };
      case 'fee_structure':
        return {
          title: 'Fee Structure Configuration',
          subtitle: 'Autonomous tuition fees, lab dues, development funds, and installment policies.'
        };
      case 'fee_collection':
        return {
          title: 'Fee Collection Counter',
          subtitle: 'Instant student receipting, payment channel realization, and printable fee receipts.'
        };
      case 'fee_outstanding':
        return {
          title: 'Outstanding Dues & Defaulters',
          subtitle: 'Active student arrears classified by aging brackets with contact records and follow-ups.'
        };
      case 'fee_installments':
        return {
          title: 'Installment Management',
          subtitle: 'Configured semester installment milestones, upcoming due dates, and partial balances.'
        };
      case 'fee_scholarships':
        return {
          title: 'Scholarships & Concessions',
          subtitle: 'PRERANA, National Scholarship Portal (NSP), merit aid, and institutional fee waivers.'
        };
      case 'fee_refunds':
        return {
          title: 'Refund Management',
          subtitle: 'Hostel caution money refunds, semester overpayment adjustments, and approved reversals.'
        };
      case 'fee_clearance':
        return {
          title: 'Student Financial Clearance',
          subtitle: 'Semester exam and degree issuance financial clearance review without blocking academic rights.'
        };
      case 'payroll_staff':
      case 'payroll_teachers':
      case 'payroll_processing':
      case 'payroll_payslips':
      case 'payroll_advances':
        return {
          title: 'Institutional Payroll & Staff Compensation',
          subtitle: '7th Pay Commission faculty & staff salaries, statutory EPF/TDS, and printable payslips.'
        };
      case 'receipt_register':
      case 'income_other':
      case 'income_hostel':
      case 'income_transport':
      case 'income_exam':
        return {
          title: 'Institutional Receipts & Auxiliary Revenue',
          subtitle: 'Receipt registers, hostel mess collections, bus fleet transit passes, and exam cell fees.'
        };
      case 'expense_register':
      case 'vendor_management':
      case 'vendor_bills':
      case 'vendor_payments':
      case 'expense_approvals':
        return {
          title: 'Campus Expenses, Procurement & Vendor Payables',
          subtitle: 'Operating utilities, laboratory procurement, vendor invoice registration, and payment tracking.'
        };
      case 'acc_chart_of_accounts':
      case 'acc_general_ledger':
      case 'acc_journal_entries':
      case 'acc_cash_book':
      case 'acc_receivable':
      case 'acc_payable':
      case 'acc_bank_reconciliation':
      case 'acc_period_closing':
        return {
          title: 'Double-Entry Accounting & Financial Ledgers',
          subtitle: 'Chart of Accounts, balanced journal vouchers, bank reconciliation statements, and period closing.'
        };
      case 'budget_annual':
      case 'budget_departments':
      case 'budget_utilization':
        return {
          title: 'Institutional Budget & Financial Planning',
          subtitle: 'Annual allocations, departmental utilization rates, committed encumbrances, and variance analysis.'
        };
      case 'rep_fee_collection':
      case 'rep_outstanding_dues':
      case 'rep_payroll':
      case 'rep_income_expenditure':
      case 'rep_trial_balance':
      case 'rep_audit_trail':
        return {
          title: 'Financial Reports, Trial Balance & Audit Trail',
          subtitle: 'Audited trial balance, income vs expenditure returns, CSV exports, and immutable audit logs.'
        };
      case 'cfg_academic_year':
      case 'cfg_fee_heads':
      case 'cfg_salary_components':
      case 'cfg_numbering':
      case 'cfg_payment_methods':
      case 'cfg_approval_workflows':
      case 'cfg_reset_demo_data':
        return {
          title: 'Finance Directorate Configuration & Settings',
          subtitle: 'Institution profile, fee heads, salary components, numbering prefixes, and demo safety controls.'
        };
      default:
        return {
          title: 'Finance & Accounts Portal',
          subtitle: 'Central Institutional Bursar'
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <AppLayout
      account={account}
      portalName="Finance Portal"
      portalSubtitle="Bursar & Accounts Directorate"
      portalHomeTab="dashboard"
      navSections={accountsNavSections}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
      pageTitle={headerInfo.title}
      pageSubtitle={headerInfo.subtitle}
    >
      <div className="accounts-content-root">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Section A: Dashboard */}
        {activeTab === 'dashboard' && (
          <AccountsDashboardTab
            feeStructures={feeStructures}
            studentLedgers={studentLedgers}
            transactions={transactions}
            payrollEmployees={payrollEmployees}
            vendorBills={vendorBills}
            expenses={expenses}
            budgets={budgets}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenRecordPayment={() => setActiveTab('fee_collection')}
            onOpenAddBill={() => setActiveTab('vendor_bills')}
          />
        )}

        {/* Section B: Student Finance */}
        {(activeTab.startsWith('fee_') || activeTab === 'students' || activeTab === 'structure') && (
          <AccountsStudentFinanceTab
            feeStructures={feeStructures}
            studentLedgers={studentLedgers}
            transactions={transactions}
            onUpdateFeeStructures={setFeeStructures}
            onUpdateStudentLedgers={setStudentLedgers}
            onUpdateTransactions={setTransactions}
            onAddAuditLog={handleAddAuditLog}
            activeTab={activeTab}
            onNavigateTab={(tab) => setActiveTab(tab)}
            initialSubtab={
              activeTab === 'fee_management' ? 'management' :
              activeTab === 'fee_structure' || activeTab === 'structure' ? 'structure' :
              activeTab === 'fee_collection' ? 'collection' :
              activeTab === 'fee_outstanding' ? 'outstanding' :
              activeTab === 'fee_installments' ? 'installments' :
              activeTab === 'fee_scholarships' ? 'scholarships' :
              activeTab === 'fee_refunds' ? 'refunds' :
              activeTab === 'fee_clearance' ? 'clearance' :
              'ledger'
            }
          />
        )}

        {/* Section C: Payroll & Employee Finance */}
        {activeTab.startsWith('payroll_') && (
          <AccountsPayrollTab
            payrollEmployees={payrollEmployees}
            onUpdatePayrollEmployees={setPayrollEmployees}
            onAddAuditLog={handleAddAuditLog}
            initialSubtab={
              activeTab === 'payroll_processing' ? 'processing' :
              activeTab === 'payroll_payslips' ? 'payslips' :
              activeTab === 'payroll_advances' ? 'advances' :
              'roster'
            }
          />
        )}

        {/* Section D: Receipts & Auxiliary Revenue */}
        {(activeTab.startsWith('receipt_') || activeTab.startsWith('income_')) && (
          <AccountsReceiptsIncomeTab
            transactions={transactions}
            otherIncome={otherIncome}
            onUpdateOtherIncome={setOtherIncome}
            onAddAuditLog={handleAddAuditLog}
            initialSubtab={
              activeTab === 'income_other' ? 'auxiliary' :
              activeTab === 'income_hostel' ? 'hostel' :
              activeTab === 'income_transport' ? 'transport' :
              activeTab === 'income_exam' ? 'exam' :
              'fee_receipts'
            }
          />
        )}

        {/* Section E: Expenses & Procurement */}
        {(activeTab.startsWith('expense_') || activeTab.startsWith('vendor_')) && (
          <AccountsExpensesProcurementTab
            expenses={expenses}
            vendorBills={vendorBills}
            vendors={vendors}
            onUpdateExpenses={setExpenses}
            onUpdateVendorBills={setVendorBills}
            onUpdateVendors={setVendors}
            onAddAuditLog={handleAddAuditLog}
            initialSubtab={
              activeTab === 'vendor_management' ? 'vendors' :
              activeTab === 'vendor_bills' ? 'bills' :
              activeTab === 'expense_approvals' ? 'approvals' :
              'expenses'
            }
          />
        )}

        {/* Section F: Accounting & General Ledger */}
        {activeTab.startsWith('acc_') && (
          <AccountsGeneralLedgerTab
            chartOfAccounts={chartOfAccounts}
            journalEntries={journalEntries}
            studentLedgers={studentLedgers}
            vendorBills={vendorBills}
            bankReconciliations={bankReconciliations}
            onUpdateJournalEntries={setJournalEntries}
            onUpdateChartOfAccounts={setChartOfAccounts}
            onUpdateBankReconciliations={setBankReconciliations}
            onAddAuditLog={handleAddAuditLog}
            initialSubtab={
              activeTab === 'acc_general_ledger' ? 'ledger' :
              activeTab === 'acc_journal_entries' ? 'journal' :
              activeTab === 'acc_cash_book' || activeTab === 'acc_bank_book' ? 'cash_bank' :
              activeTab === 'acc_receivable' || activeTab === 'acc_payable' ? 'ar_ap' :
              activeTab === 'acc_bank_reconciliation' ? 'reconciliation' :
              activeTab === 'acc_period_closing' ? 'closing' :
              'chart'
            }
          />
        )}

        {/* Section G: Budget & Financial Planning */}
        {activeTab.startsWith('budget_') && (
          <AccountsBudgetTab
            budgets={budgets}
            onUpdateBudgets={setBudgets}
            onAddAuditLog={handleAddAuditLog}
            initialSubtab={
              activeTab === 'budget_departments' ? 'departments' :
              activeTab === 'budget_utilization' ? 'variance' :
              'annual'
            }
          />
        )}

        {/* Section H: Reports & Audit */}
        {activeTab.startsWith('rep_') && (
          <AccountsReportsTab
            feeStructures={feeStructures}
            studentLedgers={studentLedgers}
            transactions={transactions}
            payrollEmployees={payrollEmployees}
            vendorBills={vendorBills}
            expenses={expenses}
            budgets={budgets}
            chartOfAccounts={chartOfAccounts}
            auditLogs={auditLogs}
            initialReportType={
              activeTab === 'rep_outstanding_dues' ? 'outstanding' :
              activeTab === 'rep_payroll' ? 'payroll' :
              activeTab === 'rep_income_expenditure' ? 'incomex' :
              activeTab === 'rep_trial_balance' ? 'trial_balance' :
              activeTab === 'rep_audit_trail' ? 'audit' :
              'collection'
            }
          />
        )}

        {/* Campus Connect Broadcast */}
        {activeTab === 'campus-connect' && (
          <CampusConnect
            account={{
              role: 'accounts',
              name: ACCOUNTS_OFFICER.name,
              id: ACCOUNTS_OFFICER.id,
              department: 'Finance & Accounts Directorate'
            }}
          />
        )}

        {/* Section I: Configuration */}
        {activeTab.startsWith('cfg_') && (
          <AccountsSettingsTab
            onResetDemoData={handleResetDemoData}
            onAddAuditLog={handleAddAuditLog}
            initialSubtab={
              activeTab === 'cfg_fee_heads' ? 'fee_heads' :
              activeTab === 'cfg_salary_components' ? 'salary_rules' :
              activeTab === 'cfg_numbering' ? 'numbering' :
              activeTab === 'cfg_payment_methods' ? 'gateways' :
              activeTab === 'cfg_approval_workflows' ? 'approvals' :
              activeTab === 'cfg_reset_demo_data' ? 'safety' :
              'institution'
            }
          />
        )}
      </div>
      </div>
    </AppLayout>
  );
}
