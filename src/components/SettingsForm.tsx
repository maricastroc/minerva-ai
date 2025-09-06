import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { handleApiError } from '@/utils/handleApiError';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'ADMIN' | 'USER';
  provider: string;
}

interface Props {
  user?: User;
}

export const SettingsForm = ({ user }: Props) => {
  const { update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        await update();
        toast.success('Profile updated successfully');
        setIsEditing(false);
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error updating profile');
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-500 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-25 mb-2">Login Method</h3>
        <p className="text-gray-100">
          You signed in with{' '}
          <span className="font-semibold text-blue-300 capitalize">
            {user?.provider}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-25 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-2 bg-gray-500 border border-gray-400 rounded text-gray-25 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-25 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing || user?.provider !== 'credentials'}
            className="w-full p-2 bg-gray-500 border border-gray-400 rounded text-gray-25 disabled:opacity-50"
          />
          {user?.provider !== 'credentials' && (
            <p className="text-xs text-gray-200 mt-1">
              Email cannot be changed for {user?.provider} accounts
            </p>
          )}
        </div>

        {/* Password Section - Only for credentials */}
        {user?.provider === 'credentials' && (
          <>
            <div className="pt-4 border-t border-gray-500">
              <h4 className="text-md font-medium text-gray-25 mb-3">
                Change Password
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-25 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter current password"
                    className="w-full p-2 bg-gray-500 border border-gray-400 rounded text-gray-25 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-25 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter new password"
                    className="w-full p-2 bg-gray-500 border border-gray-400 rounded text-gray-25 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-25 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Confirm new password"
                    className="w-full p-2 bg-gray-500 border border-gray-400 rounded text-gray-25 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex space-x-3 pt-4">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="px-4 py-2 bg-gray-500 text-gray-25 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
