import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, ProfileUpdateData } from '../../services/profile';

interface ProfileEditProps {
  open: boolean;
  onClose: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: user?.name || '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Only include fields that have been changed
      const updates: ProfileUpdateData = {};
      if (formData.name && formData.name !== user?.name) updates.name = formData.name;
      if (formData.password) updates.password = formData.password;

      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }

      const { user: updatedUser } = await updateProfile(updates);
      updateUser(updatedUser);
      setShowSuccess(true);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                disabled={isLoading}
              />
              <TextField
                disabled
                label="Email"
                value={user?.email}
                fullWidth
                helperText="Email cannot be changed"
              />
              <TextField
                label="New Password (optional)"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                disabled={isLoading}
                helperText="Leave blank to keep current password"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        message="Profile updated successfully"
      />
    </>
  );
};

export default ProfileEdit;