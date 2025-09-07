interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function IconButton({ onClick, children }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-md text-action-icon p-[0.15rem] hover:bg-action-icon-hover transition-all duration-100"
    >
      {children}
    </button>
  );
}
