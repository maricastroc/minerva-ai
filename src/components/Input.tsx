import { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-white/80 mb-2"
        >
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-4 py-3 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-blue300 transition-colors ${className} ${
            error ? 'border-primary-error' : ''
          }`}
          {...props}
        />
        {error && (
          <p className="text-primary-error text-xs mt-1">{error.message}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
