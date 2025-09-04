import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button = ({
  children,
  isLoading = false,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses =
    'cursor-pointer w-full py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-primary-blue500 text-white hover:bg-primary-blue400',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
