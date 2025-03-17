import { axiosInstance } from './axiosInstance';

export interface Group {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  totalBalance: number;
  description?: string;
  created_by: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  expenses?: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    payer?: {
      id: string;
      name: string;
    };
    creator?: {
      id: string;
      name: string;
    };
  }>;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  category: string;
  members: string[];
}

export const groupService = {
  getGroups: async (): Promise<Group[]> => {
    const response = await axiosInstance.get('/groups');
    return response.data;
  },

  getGroupDetails: async (id: string): Promise<Group> => {
    const response = await axiosInstance.get(`/groups/${id}`);
    return response.data;
  },

  createGroup: async (data: CreateGroupData): Promise<Group> => {
    const response = await axiosInstance.post('/groups', data);
    return response.data;
  },

  updateGroup: async (id: string, data: Partial<CreateGroupData>): Promise<Group> => {
    const response = await axiosInstance.put(`/groups/${id}`, data);
    return response.data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/groups/${id}`);
  }
};