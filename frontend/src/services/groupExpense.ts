import { axiosInstance } from './axiosInstance';

export interface GroupExpense {
  id: string;
  description: string;
  amount: number; // Ensure this is typed as number
  date: string;
  createdBy: {
    id: string;
    name: string;
  };
  paidBy: {
    id: string;
    name: string;
  };
  shares: Array<{
    id: string;
    expense_id: string;
    user_id: string;
    amount: number;
    user: {
      id: string;
      name: string;
      email: string;
    }
  }>;
}

export interface CreateGroupExpenseData {
  description: string;
  amount: number;
  date: string;
  paid_by: string;
  split_between: string[];
  group_id: string;
}

export interface GroupBalance {
  id: string;  // Added id field
  userId: string;
  name: string;
  balance: number;
}

export interface GroupSettlement {
  from: {
    id: string;
    name: string;
    email: string;
  };
  to: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
}

// Add GroupSettlementSuggestion type alias
export type GroupSettlementSuggestion = GroupSettlement;

export const groupExpenseService = {
  // Create a new group expense
  createGroupExpense: async (groupId: string, data: CreateGroupExpenseData): Promise<GroupExpense> => {
    const response = await axiosInstance.post(`/groups/${groupId}/expenses`, data);
    return response.data.data;
  },

  // Get all expenses for a group
  getGroupExpenses: async (groupId: string): Promise<GroupExpense[]> => {
    const response = await axiosInstance.get(`/groups/${groupId}/expenses`);
    return response.data.data;
  },

  // Get balances for a group
  getGroupBalances: async (groupId: string): Promise<GroupBalance[]> => {
    const response = await axiosInstance.get(`/groups/${groupId}/balances`);
    return response.data.data;
  },

  // Get settlement suggestions for a group
  getGroupSettlementSuggestions: async (groupId: string): Promise<GroupSettlement[]> => {
    const response = await axiosInstance.get(`/groups/${groupId}/settlements`);
    return response.data.data;
  },

  // Delete a group expense
  deleteGroupExpense: async (groupId: string, expenseId: string): Promise<void> => {
    await axiosInstance.delete(`/groups/${groupId}/expenses/${expenseId}`);
  },

  // Update a group expense
  updateGroupExpense: async (groupId: string, expenseId: string, data: CreateGroupExpenseData): Promise<GroupExpense> => {
    const response = await axiosInstance.put(`/groups/${groupId}/expenses/${expenseId}`, data);
    return response.data.data;
  }
};