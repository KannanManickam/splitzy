import { axiosInstance } from './axiosInstance';

export interface FriendRequest {
  id: string;
  name: string;
  email: string;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
}

export const friendService = {
  // Send friend request
  sendFriendRequest: async (email: string) => {
    // First get the user by email to get their ID
    const userResponse = await axiosInstance.get(`/users/by-email/${email}`);
    const friendId = userResponse.data.id;
    
    // Then send the friend request with the friend_id
    const response = await axiosInstance.post('/friends/send', { friend_id: friendId });
    return response.data;
  },

  // Accept friend request
  acceptFriendRequest: async (requestId: string) => {
    const response = await axiosInstance.put(`/friends/accept/${requestId}`);
    return response.data;
  },

  // Reject friend request
  rejectFriendRequest: async (requestId: string) => {
    const response = await axiosInstance.put(`/friends/reject/${requestId}`);
    return response.data;
  },

  // Get friend list
  getFriends: async (): Promise<Friend[]> => {
    try {
      const response = await axiosInstance.get('/friends/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  },

  // Get pending friend requests
  getPendingRequests: async (): Promise<FriendRequest[]> => {
    try {
      const response = await axiosInstance.get('/friends/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  },

  // Get sent friend requests
  getSentRequests: async (): Promise<FriendRequest[]> => {
    try {
      const response = await axiosInstance.get('/friends/sent');
      return response.data;
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      throw error;
    }
  }
};