interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function IconButton({ onClick, children }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-md text-gray-100 p-[0.15rem] hover:bg-white/10"
    >
      {children}
    </button>
  );
}
