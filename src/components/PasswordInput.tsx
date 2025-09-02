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
        className="block text-sm font-medium text-white/80 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-2 focus:border-primary-purple500 transition-colors pr-12 ${className} ${
            error ? 'border-primary-error' : ''
          }`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-primary-error text-xs mt-1">{error.message}</p>
      )}
    </div>
  );
};
