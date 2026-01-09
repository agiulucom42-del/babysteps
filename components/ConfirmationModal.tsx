
import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  themeColor?: 'rose' | 'sky' | 'red';
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  themeColor = 'rose',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) => {
  const themeClasses = {
    rose: {
      bg: 'bg-rose-100',
      text: 'text-rose-600',
      buttonBg: 'bg-rose-600',
      buttonHoverBg: 'hover:bg-rose-700',
      focusRing: 'focus:ring-rose-500',
    },
    sky: {
      bg: 'bg-sky-100',
      text: 'text-sky-600',
      buttonBg: 'bg-sky-600',
      buttonHoverBg: 'hover:bg-sky-700',
      focusRing: 'focus:ring-sky-500',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      buttonBg: 'bg-red-600',
      buttonHoverBg: 'hover:bg-red-700',
      focusRing: 'focus:ring-red-500',
    },
  };

  const currentTheme = themeClasses[themeColor] || themeClasses.rose;
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        } else if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 text-center transform transition-all animate-slide-up-fast`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${currentTheme.bg} mb-4`}>
          <AlertTriangle className={`h-6 w-6 ${currentTheme.text}`} aria-hidden="true" />
        </div>
        <h3 id="modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        <div className="mt-2">
          <p className="text-sm text-slate-500">
            {message}
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            className={`w-full justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2`}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`w-full justify-center rounded-md border border-transparent ${currentTheme.buttonBg} px-4 py-2 text-sm font-medium text-white shadow-sm ${currentTheme.buttonHoverBg} focus:outline-none focus:ring-2 ${currentTheme.focusRing} focus:ring-offset-2`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
