import { ButtonHTMLAttributes } from 'react';

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const DeleteButton = ({
  children,
  isLoading = false,
  className = '',
  ...props
}: DeleteButtonProps) => {
  const baseClasses =
    'cursor-pointer font-semibold rounded-3xl p-2 px-4 flex items-center gap-2 transition-all duration-300 max-h-[60px] text-sm bg-transparent border border-delete hover:bg-delete/10 text-delete capitalize justify-center disabled:bg-disabled disabled:border-disabled disabled:text-modal-text disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseClasses} ${className}`}
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
