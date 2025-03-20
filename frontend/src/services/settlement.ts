import { axiosInstance } from './axiosInstance';

export interface Settlement {
  id: string;
  payer: {
    id: string;
    name: string;
    email: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  date: string;
  notes?: string;
  group?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export interface CreateSettlementData {
  payer_id: string;
  receiver_id: string;
  amount: number;
  date: string;
  notes?: string;
  group_id?: string;
}

export interface BalanceWithSettlements {
  originalBalance: number;
  settlementBalance: number;
  netBalance: number;
  settlements: Settlement[];
}

export const settlementService = {
  // Create a new settlement
  createSettlement: async (data: CreateSettlementData): Promise<Settlement> => {
    const response = await axiosInstance.post('/settlements', data);
    return response.data.data;
  },

  // Get all settlements for the current user
  getUserSettlements: async (): Promise<Settlement[]> => {
    const response = await axiosInstance.get('/settlements');
    return response.data.data;
  },

  // Get a specific settlement by ID
  getSettlementById: async (settlementId: string): Promise<Settlement> => {
    const response = await axiosInstance.get(`/settlements/${settlementId}`);
    return response.data.data;
  },

  // Update a settlement (only notes can be updated)
  updateSettlement: async (settlementId: string, notes: string): Promise<Settlement> => {
    const response = await axiosInstance.put(`/settlements/${settlementId}`, { notes });
    return response.data.data;
  },

  // Get settlements and balance between current user and a friend
  getSettlementsWithFriend: async (friendId: string): Promise<BalanceWithSettlements> => {
    const response = await axiosInstance.get(`/settlements/friend/${friendId}`);
    return response.data.data;
  },

  // Delete a settlement
  deleteSettlement: async (settlementId: string): Promise<void> => {
    await axiosInstance.delete(`/settlements/${settlementId}`);
  },

  // Get settlements for a group
  getGroupSettlements: async (groupId: string): Promise<Settlement[]> => {
    const response = await axiosInstance.get(`/settlements/group/${groupId}`);
    return response.data.data;
  }
};