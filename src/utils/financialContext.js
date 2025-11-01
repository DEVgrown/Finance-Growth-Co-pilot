// Financial context utilities for voice assistant
import { base44 } from '../api/base44Client';

/**
 * Build financial context for system prompts
 */
export async function buildFinancialContext() {
  try {
    // Fetch all financial data in parallel
    const [transactions, invoices, business, user, summary] = await Promise.all([
      base44.entities.Transaction.list('-transaction_date', 90).catch(() => []),
      base44.entities.Invoice.list('-created_date', 50).catch(() => []),
      base44.entities.Business.list().then(businesses => businesses[0] || null).catch(() => null),
      base44.auth.me().catch(() => null),
      base44.integrations?.Core?.getFinancialSummary?.().catch(() => null) || Promise.resolve(null),
    ]);

    const now = new Date();
    
    // Calculate date ranges
    const last7Days = transactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      return (now - tDate) / (1000 * 60 * 60 * 24) <= 7;
    });
    
    const last30Days = transactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      return (now - tDate) / (1000 * 60 * 60 * 24) <= 30;
    });

    // Calculate metrics
    const weekIncome = last7Days.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const weekExpenses = last7Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const monthIncome = last30Days.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const monthExpenses = last30Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);

    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    const pendingInvoices = invoices.filter(i => i.status === 'sent');
    const totalOutstanding = [...overdueInvoices, ...pendingInvoices].reduce((sum, i) => sum + (i.total_amount || 0), 0);

    return {
      business: business || { business_name: 'SME' },
      user: user || { full_name: 'Business Owner' },
      last7Days: {
        income: weekIncome,
        expenses: weekExpenses,
        net: weekIncome - weekExpenses,
      },
      last30Days: {
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses,
      },
      invoices: {
        overdue: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce((s, i) => s + (i.total_amount || 0), 0),
        pending: pendingInvoices.length,
        pendingAmount: pendingInvoices.reduce((s, i) => s + (i.total_amount || 0), 0),
        totalOutstanding: totalOutstanding,
      },
      transactions: {
        total: transactions.length,
        last7Days: last7Days.length,
        last30Days: last30Days.length,
      },
    };
  } catch (error) {
    console.error('Error building financial context:', error);
    return null;
  }
}

/**
 * Format financial context as system prompt text
 */
export function formatFinancialContext(context) {
  if (!context) {
    return '';
  }

  try {
    return `
FINANCIAL DATA (Last 7 Days):
- Income: KES ${(context.last7Days?.income || 0).toLocaleString()}
- Expenses: KES ${(context.last7Days?.expenses || 0).toLocaleString()}
- Net: KES ${(context.last7Days?.net || 0).toLocaleString()}

FINANCIAL DATA (Last 30 Days):
- Income: KES ${(context.last30Days?.income || 0).toLocaleString()}
- Expenses: KES ${(context.last30Days?.expenses || 0).toLocaleString()}
- Net: KES ${(context.last30Days?.net || 0).toLocaleString()}

INVOICES:
- Overdue: ${context.invoices?.overdue || 0} invoices (KES ${(context.invoices?.overdueAmount || 0).toLocaleString()})
- Pending Payment: ${context.invoices?.pending || 0} invoices (KES ${(context.invoices?.pendingAmount || 0).toLocaleString()})
- Total Outstanding: KES ${(context.invoices?.totalOutstanding || 0).toLocaleString()}

BUSINESS: ${context.business?.business_name || 'SME'}
OWNER: ${context.user?.full_name || 'Business Owner'}`;
  } catch (error) {
    console.error('Error formatting financial context:', error);
    return '';
  }
}

