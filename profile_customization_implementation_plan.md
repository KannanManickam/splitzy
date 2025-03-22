# Profile Customization Implementation Plan

## Overview

This document outlines the implementation plan for the Profile Customization features listed in the "Coming Soon" section of the README. The current Profile page already has a basic structure showing user information (name, email, member since date) and quick action buttons, but lacks the customization features mentioned in the roadmap.

## Current State Analysis

### Backend

- The User model currently has basic fields: id, name, email, password, created_at, updated_at ✅
- The backend has basic user authentication endpoints (register, login, getProfile, getUserByEmail) ✅
- No endpoints exist for updating user preferences or profile information beyond the basic fields ✅

### Frontend

- The Profile component displays basic user information with a clean UI ✅
- The component includes an Edit button that currently has no functionality
- No forms or interfaces exist for updating user preferences

## Implementation Plan

### 1. Backend Enhancements

#### 1.1 User Model Extension

Extend the User model in `/backend/src/models/User.js` to include new fields ✅

```javascript
// Add these fields to the User model
currency_preference: {
  type: DataTypes.STRING,
  allowNull: true,
  defaultValue: 'USD'
},
timezone: {
  type: DataTypes.STRING,
  allowNull: true,
  defaultValue: 'UTC'
},
notification_preferences: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: {
    email_notifications: true,
    expense_reminders: true,
    settlement_notifications: true,
    weekly_summary: false
  }
},
profile_picture: {
  type: DataTypes.STRING,
  allowNull: true
}
```

#### 1.2 Database Migration

Create a migration file to add the new columns to the users table ✅

```sql
-- Create file: /backend/src/migrations/add_profile_customization_fields.sql
ALTER TABLE users
ADD COLUMN currency_preference VARCHAR(10) DEFAULT 'USD',
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN notification_preferences JSONB DEFAULT '{"email_notifications": true, "expense_reminders": true, "settlement_notifications": true, "weekly_summary": false}',
ADD COLUMN profile_picture VARCHAR(255);
```

#### 1.3 API Endpoints

Add new endpoints to the userController.js file ✅

1. **Update Profile Information**
   - Endpoint: `PUT /api/users/profile`
   - Controller: `updateProfile`
   - Functionality: Update name, email, and password

2. **Update Preferences**
   - Endpoint: `PUT /api/users/preferences`
   - Controller: `updatePreferences`
   - Functionality: Update currency, timezone, and notification preferences

3. **Upload Profile Picture**
   - Endpoint: `POST /api/users/profile-picture`
   - Controller: `uploadProfilePicture`
   - Functionality: Upload and store profile picture

### 2. Frontend Enhancements

#### 2.1 Profile Service

Create a new service file for profile-related API calls:

```typescript
// Create file: /frontend/src/services/profile.ts
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

export const updateProfile = async (data: { name?: string; email?: string; password?: string }) => {
  const response = await axiosInstance.put('/users/profile', data);
  return response.data;
};

export const updatePreferences = async (preferences: UserPreferences) => {
  const response = await axiosInstance.put('/users/preferences', preferences);
  return response.data;
};

export const uploadProfilePicture = async (formData: FormData) => {
  const response = await axiosInstance.post('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
```

#### 2.2 AuthContext Extension

Extend the AuthContext to include the new user fields and update functions:

```typescript
// Update /frontend/src/contexts/AuthContext.tsx

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  currency_preference?: string;
  timezone?: string;
  notification_preferences?: {
    email_notifications: boolean;
    expense_reminders: boolean;
    settlement_notifications: boolean;
    weekly_summary: boolean;
  };
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Add updateUser function to AuthProvider
const updateUser = (userData: Partial<User>) => {
  if (user) {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }
};

// Include updateUser in the context value
return (
  <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
    {children}
  </AuthContext.Provider>
);
```

#### 2.3 Profile Component Updates

Create new components for profile customization:

1. **ProfileEdit.tsx** - Form for editing basic profile information
2. **PreferencesForm.tsx** - Form for editing preferences
3. **ProfilePictureUpload.tsx** - Component for uploading profile picture

Update the Profile.tsx component to include these new components and functionality.

#### 2.4 UI Components

1. **Currency Selector** - Dropdown with common currencies
2. **Timezone Selector** - Dropdown with timezones
3. **Notification Toggles** - Switches for different notification types
4. **Profile Picture Upload** - Image upload with preview and cropping

### 3. Implementation Phases

#### Phase 1: Backend Infrastructure ✅

1. Extend User model with new fields ✅
2. Create database migration ✅
3. Implement API endpoints for profile updates ✅
4. Add validation middleware ✅

#### Phase 2: Frontend Basic Profile Editing ✅

1. Create profile service ✅
2. Extend AuthContext ✅
3. Implement ProfileEdit component ✅
4. Connect to backend API ✅

#### Phase 3: Preferences Implementation ✅

1. Implement currency and timezone selectors ✅
2. Create notification preference toggles ✅
3. Connect to backend API ✅

#### Phase 4: Profile Picture Upload

1. Implement file upload component
2. Add image preview and cropping
3. Connect to backend API
4. Update avatar display in UI

### 4. Deployment Considerations

1. Database migration strategy
2. Backward compatibility for existing users
3. Storage solution for profile pictures (local vs cloud)
4. CDN configuration for serving images

## Next Steps

The recommended implementation order is:

1. Start with the backend model extensions and migrations ✅
2. Implement basic profile editing (name, email) ✅
3. Add currency and timezone preferences ✅
4. Implement notification preferences ✅
5. Add profile picture upload functionality

This phased approach allows for incremental delivery of value while managing complexity.