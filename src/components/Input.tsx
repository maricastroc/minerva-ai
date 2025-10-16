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
          className="block text-sm font-medium text-secondary-text mb-2"
        >
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-4 py-3 border border-input-border rounded-lg text-primary-text focus:outline-none focus:border-primary-blue300 transition-colors ${className} ${
            error ? 'border-error' : ''
          }`}
          {...props}
        />
        {error && <p className="text-error text-xs mt-1">{error.message}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
