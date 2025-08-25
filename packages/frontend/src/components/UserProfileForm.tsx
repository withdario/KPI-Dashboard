import React, { useState, useEffect } from 'react';
import { UserProfile } from '../contexts/UserSettingsContext';
import useUserSettings from '../hooks/useUserSettings';

interface UserProfileFormProps {
  onSave?: (profile: UserProfile) => void;
  onCancel?: () => void;
  className?: string;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  onSave, 
  onCancel, 
  className = '' 
}) => {
  const { useUserProfile, useUpdateUserProfile } = useUserSettings();
  const { data: profile, isLoading, error } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    avatar: ''
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedProfile = await updateProfile.mutateAsync(formData);
      setIsDirty(false);
      onSave?.(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(profile);
      setIsDirty(false);
    }
    onCancel?.();
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 p-4 border border-red-200 rounded-lg ${className}`}>
        <p>Failed to load profile: {error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} data-testid="user-profile-form">
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={formData.avatar || 'https://via.placeholder.com/64'}
                alt="Profile"
              />
            </div>
            <div>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Change Photo
              </button>
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This email will be used for account notifications and password recovery.
            </p>
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Contact Preferences</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="marketingEmails"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="marketingEmails" className="ml-2 text-sm text-gray-700">
                Receive marketing and promotional emails
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="productUpdates"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="productUpdates" className="ml-2 text-sm text-gray-700">
                Receive product updates and new feature announcements
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="securityAlerts"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="securityAlerts" className="ml-2 text-sm text-gray-700">
                Receive security alerts and account notifications
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            updateProfile.isPending ? 'animate-pulse' : ''
          }`}
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default UserProfileForm;
