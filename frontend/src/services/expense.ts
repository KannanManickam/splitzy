import { axiosInstance } from './axiosInstance';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: {
    id: string;
    name: string;
  };
  splitBetween: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  splitBetween: string[];
}

export const expenseService = {
  createExpense: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await axiosInstance.post('/expenses', {
      ...data,
      amount: parseFloat(data.amount.toString())
    });
    return response.data;
  },

  getExpenses: async (): Promise<Expense[]> => {
    const response = await axiosInstance.get('/expenses');
    return response.data;
  },

  updateExpense: async (id: string, data: Partial<CreateExpenseData>): Promise<Expense> => {
    const response = await axiosInstance.put(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/expenses/${id}`);
  }
};
