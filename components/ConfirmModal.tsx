
import React, { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

type ThemeColor = 'rose' | 'sky' | 'teal' | 'orange' | 'red';
type IconType = 'warning' | 'success';

// --- Static Theme Mapping for Tailwind ---
const themeMap = {
  rose: {
    bg: 'bg-rose-500',
    hoverBg: 'hover:bg-rose-600',
    ring: 'focus-visible:ring-rose-400',
    iconContainerBg: 'bg-rose-50',
    iconColor: 'text-rose-400',
  },
  sky: {
    bg: 'bg-sky-500',
    hoverBg: 'hover:bg-sky-600',
    ring: 'focus-visible:ring-sky-400',
    iconContainerBg: 'bg-sky-50',
    iconColor: 'text-sky-400',
  },
  teal: {
    bg: 'bg-teal-500',
    hoverBg: 'hover:bg-teal-600',
    ring: 'focus-visible:ring-teal-400',
    iconContainerBg: 'bg-teal-50',
    iconColor: 'text-teal-400',
  },
  orange: {
    bg: 'bg-orange-500',
    hoverBg: 'hover:bg-orange-600',
    ring: 'focus-visible:ring-orange-400',
    iconContainerBg: 'bg-orange-50',
    iconColor: 'text-orange-400',
  },
  red: {
    bg: 'bg-red-500',
    hoverBg: 'hover:bg-red-600',
    ring: 'focus-visible:ring-red-400',
    iconContainerBg: 'bg-red-50',
    iconColor: 'text-red-400',
  }
};

const iconMap: Record<IconType, (className: string) => React.ReactElement> = {
  warning: (className) => <AlertTriangle className={className} />,
  success: (className) => <CheckCircle className={className} />,
};


interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  themeColor?: ThemeColor;
  icon?: IconType;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  themeColor = 'rose',
  icon = 'warning',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const theme = themeMap[themeColor] || themeMap.rose;

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const Icon = iconMap[icon];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-sm p-6 bg-white rounded-2xl shadow-xl transform transition-all animate-slide-up-fast"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${theme.iconContainerBg}`}>
            {Icon(`w-12 h-12 ${theme.iconColor}`)}
          </div>
          <h2 id="modal-title" className="text-xl font-bold text-slate-800">
            {title}
          </h2>
          <p id="modal-description" className="mt-2 text-sm text-slate-600">
            {description}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.bg} ${theme.hoverBg} ${theme.ring}`}
          >
            {confirmText}
          </button>
        </div>

         <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Kapat"
        >
            <XCircle size={20} />
        </button>

      </div>
    </div>
  );
};

export default ConfirmModal;
