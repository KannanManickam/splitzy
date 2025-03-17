import { axiosInstance } from './axiosInstance';

export interface Balance {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export interface ExpenseHistoryItem {
  id: string;
  description: string;
  date: string;
  type: 'youPaid' | 'friendPaid';
  totalAmount: number;
  friendOwes?: number; // When user paid
  youOwe?: number; // When friend paid
  paidBy: string;
}

export interface BalanceWithFriend {
  balance: number;
  expenseHistory: ExpenseHistoryItem[];
}

export interface PaymentToMake {
  to: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
}

export interface PaymentToReceive {
  from: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
}

export interface PaymentSuggestion {
  type: 'youShouldPay' | 'youShouldReceive';
  payments: PaymentToMake[] | PaymentToReceive[];
}

/**
 * Get all balances with friends
 */
export const getFriendBalances = async (): Promise<Balance[]> => {
  try {
    const response = await axiosInstance.get('/balances');
    return response.data.data;
  } catch (error) {
    console.error('Error getting friend balances:', error);
    throw error;
  }
};

/**
 * Get detailed balance with a specific friend
 */
export const getBalanceWithFriend = async (friendId: string): Promise<BalanceWithFriend> => {
  try {
    const response = await axiosInstance.get(`/balances/friend/${friendId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error getting balance with friend:', error);
    throw error;
  }
};

/**
 * Get payment suggestions for the current user
 */
export const getPaymentSuggestions = async (): Promise<PaymentSuggestion[]> => {
  try {
    const response = await axiosInstance.get('/balances/suggestions');
    return response.data.data;
  } catch (error) {
    console.error('Error getting payment suggestions:', error);
    throw error;
  }
};