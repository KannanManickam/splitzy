import { axiosInstance } from './axiosInstance';

export interface UserPreferences {
  currency_preference: string;
  timezone: string;
  notification_preferences: {
    email_notifications: boolean;
    expense_reminders: boolean;
    settlement_notifications: boolean;
    weekly_summary: boolean;
  };
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  password?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  currency_preference?: string;
  timezone?: string;
  notification_preferences?: UserPreferences['notification_preferences'];
  profile_picture?: string;
}

export const getProfile = async (): Promise<{ user: User }> => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};

export const updateProfile = async (data: ProfileUpdateData): Promise<{ user: User }> => {
  const response = await axiosInstance.put('/users/profile', data);
  return response.data;
};

export const updatePreferences = async (preferences: Partial<UserPreferences>): Promise<{ user: User }> => {
  const response = await axiosInstance.put('/users/preferences', preferences);
  return response.data;
};

export const uploadProfilePicture = async (file: File): Promise<{ user: User }> => {
  const formData = new FormData();
  formData.append('profile_picture', file);

  const response = await axiosInstance.post('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};