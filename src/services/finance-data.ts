export type TransactionType = "income" | "expense";
export type Category = 
  | "Food & Dining"
  | "Shopping"
  | "Transportation"
  | "Bills & Utilities"
  | "Entertainment"
  | "Healthcare"
  | "Travel"
  | "Education"
  | "Salary"
  | "Freelance"
  | "Investment"
  | "Other";

  export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    category: Category;
    description: string;
    date: string; // ISO date string
    tags?: string[];
  }

  export interface Budget {
    category: Category;
    limit: number;
    spent: number;
  }

  export interface SpendingByCategory {
    category: Category;
    total: number;
    percentage: number;
    transactionCount: number;
  }

  export interface SpendingTrend {
    date: string; // YYYY-MM-DD
    income: number;
    expenses: number;
    net: number;
  }

  let transactions: Transaction[] = [
    {
      id: "1",
      type: "income",
      amount: 5000,
      category: "Salary",
      description: "Monthly salary",
      date: "2024-01-15",
    },
    {
      id: "2",
      type: "expense",
      amount: 45.50,
      category: "Food & Dining",
      description: "Grocery shopping",
      date: "2024-01-16",
    },
    {
      id: "3",
      type: "expense",
      amount: 1200,
      category: "Bills & Utilities",
      description: "Rent payment",
      date: "2024-01-01",
    },
    {
      id: "4",
      type: "expense",
      amount: 89.99,
      category: "Shopping",
      description: "New headphones",
      date: "2024-01-18",
    },
    {
      id: "5",
      type: "expense",
      amount: 25.00,
      category: "Transportation",
      description: "Uber ride",
      date: "2024-01-17",
    },
    {
      id: "6",
      type: "income",
      amount: 500,
      category: "Freelance",
      description: "Web design project",
      date: "2024-01-20",
    },
  ];

  let budgets: Budget[] = [
    { category: "Food & Dining", limit: 500, spent: 245.50 },
    { category: "Shopping", limit: 300, spent: 89.99 },
    { category: "Transportation", limit: 200, spent: 25.00 },
    { category: "Entertainment", limit: 150, spent: 0 },
  ];

  // Tool functions
export const addTransaction = async (
    transaction: Omit<Transaction, "id">
  ): Promise<Transaction> => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    transactions.push(newTransaction);
    
    // Update budget spent amount if it's an expense
    if (transaction.type === "expense") {
      const budget = budgets.find(b => b.category === transaction.category);
      if (budget) {
        budget.spent += transaction.amount;
      }
    }
    
    return newTransaction;
  };

  export const getTransactions = async (filter?: {
    type?: TransactionType;
    category?: Category;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Transaction[]> => {
    let filtered = [...transactions];
  
    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(t => t.type === filter.type);
      }
      if (filter.category) {
        filtered = filtered.filter(t => t.category === filter.category);
      }
      if (filter.startDate) {
        filtered = filtered.filter(t => t.date >= filter.startDate!);
      }
      if (filter.endDate) {
        filtered = filtered.filter(t => t.date <= filter.endDate!);
      }
    }
  
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit);
    }
  
    return filtered;
  };

  export const getSpendingByCategory = async (filter?: {
    startDate?: string;
    endDate?: string;
    type?: TransactionType;
  }): Promise<SpendingByCategory[]> => {
    let filtered = transactions.filter(t => 
      filter?.type ? t.type === filter.type : t.type === "expense"
    );
  
    if (filter?.startDate) {
      filtered = filtered.filter(t => t.date >= filter.startDate!);
    }
    if (filter?.endDate) {
      filtered = filtered.filter(t => t.date <= filter.endDate!);
    }
  
    const categoryMap = new Map<Category, { total: number; count: number }>();
  
    filtered.forEach(transaction => {
      const existing = categoryMap.get(transaction.category) || { total: 0, count: 0 };
      categoryMap.set(transaction.category, {
        total: existing.total + transaction.amount,
        count: existing.count + 1,
      });
    });
  
    const total = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.total, 0);
  
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
      transactionCount: data.count,
    })).sort((a, b) => b.total - a.total);
  };

  export const getSpendingTrend = async (filter?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<SpendingTrend[]> => {
    const groupBy = filter?.groupBy || "day";
    let filtered = [...transactions];
  
    if (filter?.startDate) {
      filtered = filtered.filter(t => t.date >= filter.startDate!);
    }
    if (filter?.endDate) {
      filtered = filtered.filter(t => t.date <= filter.endDate!);
    }
  
    const trendMap = new Map<string, { income: number; expenses: number }>();
  
    filtered.forEach(transaction => {
      let key: string;
      const date = new Date(transaction.date);
  
      if (groupBy === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else if (groupBy === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        key = transaction.date;
      }
  
      const existing = trendMap.get(key) || { income: 0, expenses: 0 };
      if (transaction.type === "income") {
        existing.income += transaction.amount;
      } else {
        existing.expenses += transaction.amount;
      }
      trendMap.set(key, existing);
    });
  
    return Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  export const getBudgetStatus = async (): Promise<Budget[]> => {
    return [...budgets];
  };
  
  export const setBudget = async (
    category: Category,
    limit: number
  ): Promise<Budget> => {
    let budget = budgets.find(b => b.category === category);
    if (budget) {
      budget.limit = limit;
    } else {
      budget = { category, limit, spent: 0 };
      budgets.push(budget);
    }
    return budget;
  };

  export const getSummary = async (filter?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
  }> => {
    let filtered = [...transactions];
  
    if (filter?.startDate) {
      filtered = filtered.filter(t => t.date >= filter.startDate!);
    }
    if (filter?.endDate) {
      filtered = filtered.filter(t => t.date <= filter.endDate!);
    }
  
    const totalIncome = filtered
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filtered
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: filtered.length,
    };
  };