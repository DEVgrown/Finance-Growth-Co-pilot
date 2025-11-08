// Financial context utilities for voice assistant
import base44 from '../api/base44Client';
import apiClient from '../lib/apiClient';
import { queryClient } from '../lib/queryClient';

/**
 * Build financial context for system prompts
 * Uses cached data from React Query to match what user sees in dashboard
 */
export async function buildFinancialContext() {
  try {
    // Get authenticated user with full profile data
    const user = await base44.auth.me().catch(() => null);
    
    // Get all businesses the user has access to
    const businesses = await base44.entities.Business.list().catch(() => []);
    
    // Determine active business (prefer business_admin role)
    let activeBusiness = businesses.find(b => b.role === 'business_admin') || businesses[0] || null;
    const businessId = activeBusiness?.id;
    
    // Get user's role in the active business
    const userRole = activeBusiness?.role || 'owner';

    // Try to get cached dashboard data first (what user sees)
    let dashboardData = queryClient.getQueryData(['user-dashboard', businessId]);
    
    // If not in cache, fetch it
    if (!dashboardData && businessId) {
      try {
        dashboardData = await apiClient.request(`/users/user/dashboard/${businessId}/`);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    }

    // Get transactions and invoices from cache first (what user sees in UI)
    let transactions = queryClient.getQueryData(['transactions', businessId]) || [];
    let invoices = queryClient.getQueryData(['invoices', businessId]) || [];
    
    // If not in cache, fetch them
    if (transactions.length === 0 && businessId) {
      transactions = await apiClient.getTransactions({ business: businessId }).catch(() => []);
    }
    if (invoices.length === 0 && businessId) {
      invoices = await apiClient.getInvoices({ business: businessId }).catch(() => []);
    }

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
      business: activeBusiness || { business_name: 'SME' },
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name || user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_superuser: user.is_superuser || false,
      } : { full_name: 'Business Owner' },
      role: userRole,
      businesses: businesses.map(b => ({
        id: b.id,
        name: b.legal_name || b.business_name || b.name,
        role: b.role,
      })),
      dashboardData: dashboardData, // Include raw dashboard data
      last7Days: {
        income: weekIncome,
        expenses: weekExpenses,
        net: weekIncome - weekExpenses,
        transactionCount: last7Days.length,
      },
      last30Days: {
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses,
        transactionCount: last30Days.length,
      },
      invoices: {
        overdue: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce((s, i) => s + (i.total_amount || 0), 0),
        pending: pendingInvoices.length,
        pendingAmount: pendingInvoices.reduce((s, i) => s + (i.total_amount || 0), 0),
        totalOutstanding: totalOutstanding,
        total: invoices.length,
      },
      transactions: {
        total: transactions.length,
        last7Days: last7Days.length,
        last30Days: last30Days.length,
        recentTransactions: transactions.slice(0, 5).map(t => ({
          date: t.transaction_date,
          type: t.type,
          amount: t.amount,
          description: t.description,
        })),
      },
      timestamp: new Date().toISOString(),
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
    const businessName = context.business?.legal_name || context.business?.business_name || context.business?.name || 'SME';
    const ownerName = context.user?.full_name || context.user?.first_name || 'Business Owner';
    const userRole = context.role || 'owner';
    const userEmail = context.user?.email || '';

    let prompt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FINANCIAL CONTEXT - REAL-TIME DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 USER INFORMATION:
- Name: ${ownerName}
- Email: ${userEmail}
- Role: ${userRole.toUpperCase()}
- Business: ${businessName}
${context.user?.is_superuser ? '- Status: SUPER ADMIN (Full System Access)\n' : ''}`;

    // Add business list if user has multiple businesses
    if (context.businesses && context.businesses.length > 1) {
      prompt += `\n📍 YOUR BUSINESSES (${context.businesses.length}):\n`;
      context.businesses.forEach((biz, idx) => {
        prompt += `  ${idx + 1}. ${biz.name} (${biz.role})\n`;
      });
    }

    prompt += `\n💰 FINANCIAL DATA (Last 7 Days):
- Income: KES ${(context.last7Days?.income || 0).toLocaleString()}
- Expenses: KES ${(context.last7Days?.expenses || 0).toLocaleString()}
- Net Profit/Loss: KES ${(context.last7Days?.net || 0).toLocaleString()}
- Transactions: ${context.last7Days?.transactionCount || 0}

💰 FINANCIAL DATA (Last 30 Days):
- Income: KES ${(context.last30Days?.income || 0).toLocaleString()}
- Expenses: KES ${(context.last30Days?.expenses || 0).toLocaleString()}
- Net Profit/Loss: KES ${(context.last30Days?.net || 0).toLocaleString()}
- Transactions: ${context.last30Days?.transactionCount || 0}

📄 INVOICES STATUS:
- Total Invoices: ${context.invoices?.total || 0}
- Overdue: ${context.invoices?.overdue || 0} invoices (KES ${(context.invoices?.overdueAmount || 0).toLocaleString()})
- Pending Payment: ${context.invoices?.pending || 0} invoices (KES ${(context.invoices?.pendingAmount || 0).toLocaleString()})
- Total Outstanding: KES ${(context.invoices?.totalOutstanding || 0).toLocaleString()}`;

    // Add recent transactions if available
    if (context.transactions?.recentTransactions && context.transactions.recentTransactions.length > 0) {
      prompt += `\n\n📝 RECENT TRANSACTIONS (Last 5):\n`;
      context.transactions.recentTransactions.forEach((t, idx) => {
        const date = new Date(t.date).toLocaleDateString('en-KE');
        const type = t.type === 'income' ? '💵 Income' : '💸 Expense';
        prompt += `  ${idx + 1}. ${date} - ${type}: KES ${(t.amount || 0).toLocaleString()} - ${t.description || 'N/A'}\n`;
      });
    }

    // Add dashboard-specific data if available
    if (context.dashboardData) {
      const dash = context.dashboardData;
      if (dash.my_work) {
        prompt += `\n\n📋 YOUR WORK SUMMARY:
- Your Invoices: ${dash.my_work.invoices || 0}
- Pending Tasks: ${dash.my_work.pending_tasks || 0}
- Your Customers: ${dash.my_work.customers || 0}`;
      }
    }

    prompt += `\n\n⏰ Data Updated: ${new Date(context.timestamp || Date.now()).toLocaleString('en-KE')}`;
    prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    prompt += `\n⚠️ IMPORTANT: Use the EXACT numbers above when answering questions about finances. This is REAL data from ${ownerName}'s business, not generic examples.\n`;

    return prompt;
  } catch (error) {
    console.error('Error formatting financial context:', error);
    return '';
  }
}

