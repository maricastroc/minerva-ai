import { InputHTMLAttributes, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError | undefined;
  showPasswordToggle?: boolean;
}

export const PasswordInput = ({
  label,
  error,
  showPasswordToggle = true,
  className = '',
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-secondary-text mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-4 py-3 border border-input-border rounded-lg text-secondary-text placeholder-input-border focus:outline-none focus:primary-blue-500 transition-colors pr-12 ${className} ${
            error ? 'border-error' : ''
          }`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text hover:text-white transition-colors"
          >
            {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-error text-xs mt-1">{error.message}</p>}
    </div>
  );
};
