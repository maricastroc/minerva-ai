import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { handleApiError } from '@/utils/handleApiError';

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="cursor-pointer rounded-md text-gray-200 p-[0.15rem] hover:bg-white/10"
    >
      <FontAwesomeIcon
        className="text-primary-gray300"
        icon={copied ? faCheck : faCopy}
      />
    </button>
  );
}
