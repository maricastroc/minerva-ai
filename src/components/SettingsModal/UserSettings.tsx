import { Icon } from '@iconify/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';
import { handleApiError } from '@/utils/handleApiError';
import useRequest from '@/hooks/useRequest';
import { useSession } from 'next-auth/react';

const socialProviders = [
  { name: 'Google', icon: 'flat-color-icons:google', provider: 'google' },
  { name: 'Github', icon: 'ant-design:github-outlined', provider: 'github' },
];

interface UserData {
  name: string;
  email: string;
  avatarUrl?: string;
  provider?: string;
}

export const UserSettings = () => {
  const [activeForm, setActiveForm] = useState<'email' | 'password' | null>(
    null
  );

  const session = useSession();

  const [isLoading, setIsLoading] = useState(false);

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: user, mutate: mutateUser } = useRequest<UserData>({
    url: '/user',
    method: 'GET',
  });

  const provider = session?.data?.user?.provider;
  const providerData = socialProviders.find((p) => p.provider === provider);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailData.newEmail || !emailData.password) {
      toast.error('Please fill all fields');
      return;
    }

    if (emailData.newEmail === user?.email) {
      toast.error('New email must be different from current email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put('/user/email', {
        newEmail: emailData.newEmail,
        password: emailData.password,
      });

      toast.success(response.data.message);
      await mutateUser();
      setActiveForm(null);
      setEmailData({ newEmail: '', password: '' });
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error('Please fill all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success(response.data.message);
      await mutateUser();
      setActiveForm(null);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelForm = () => {
    setActiveForm(null);
    setEmailData({ newEmail: '', password: '' });
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="text-[15px] divide-y divide-divider-line text-primary-text">
      <div className="flex items-center justify-between py-3">
        <p className="font-medium">Name</p>
        <div className="flex items-center gap-2">
          <span>{user?.name}</span>
          {providerData && <Icon icon={providerData.icon} fontSize={20} />}
        </div>
      </div>

      <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium">Email</p>
          <div className="flex items-center gap-3">
            <span>{user?.email ?? '-'}</span>
            {!providerData && activeForm !== 'email' && (
              <button
                onClick={() => setActiveForm('email')}
                className="cursor-pointer text-sm text-blue-400 hover:underline"
              >
                Change
              </button>
            )}
          </div>
        </div>

        {activeForm === 'email' && (
          <form
            onSubmit={handleEmailSubmit}
            className="mt-3 p-3 bg-gray-700/20 rounded-lg"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-secondary-text mb-1">
                  New Email
                </label>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      newEmail: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-chat-input border border-input-border rounded-lg text-primary-text focus:outline-none focus:border-blue-500"
                  placeholder="Enter new email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-secondary-text mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={emailData.password}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-chat-input border border-input-border rounded-lg text-primary-text focus:outline-none focus:border-blue-500"
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Update Email'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  disabled={isLoading}
                  className="px-4 py-2 bg-cancel text-primary-text rounded-lg hover:bg-cancel-hover disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {!providerData && (
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">Password</p>
            {activeForm !== 'password' && (
              <button
                onClick={() => setActiveForm('password')}
                className="cursor-pointer text-sm text-blue-400 hover:underline"
              >
                Change
              </button>
            )}
          </div>

          {activeForm === 'password' && (
            <form
              onSubmit={handlePasswordSubmit}
              className="mt-3 p-3 bg-gray-700/20 rounded-lg"
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-secondary-text mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-chat-input border border-input-border rounded-lg text-primary-text focus:outline-none focus:border-blue-500"
                    placeholder="Enter your current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-secondary-text mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-chat-input border border-input-border rounded-lg text-primary-text focus:outline-none focus:border-blue-500"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-secondary-text mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-chat-input border border-input-border rounded-lg text-primary-text focus:outline-none focus:border-blue-500"
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    disabled={isLoading}
                    className="px-4 py-2 bg-cancel text-primary-text rounded-lg hover:bg-cancel-hover disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
