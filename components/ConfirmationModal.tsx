
import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  themeColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  themeColor = 'rose',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement | undefined;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement | undefined;

      // Set initial focus on the cancel button for safety
      cancelButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        } else if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Static map for Tailwind CSS JIT compiler.
  // Dynamic class names like `bg-${themeColor}-600` won't be detected at build time.
  // This map ensures the full class names are present in the source code.
  const themeStyles = {
    sky: {
      bg: 'bg-sky-600',
      hoverBg: 'hover:bg-sky-700',
      ring: 'focus-visible:ring-sky-500',
      iconBg: 'bg-sky-100',
      iconText: 'text-sky-600',
    },
    rose: {
      bg: 'bg-rose-600',
      hoverBg: 'hover:bg-rose-700',
      ring: 'focus-visible:ring-rose-500',
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
    },
  };

  const styles = themeStyles[themeColor as keyof typeof themeStyles] || themeStyles.rose;


  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm m-4 transform transition-all duration-300 ease-out animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg} mb-4`}>
            <AlertTriangle className={`h-6 w-6 ${styles.iconText}`} aria-hidden="true" />
          </div>
          <h3 id="modal-title" className="text-lg font-bold text-slate-800">
            {title}
          </h3>
          <p id="modal-description" className="mt-2 text-sm text-slate-500">{message}</p>
        </div>
        <div className="bg-slate-50 grid grid-cols-2 gap-3 px-6 py-4 rounded-b-2xl">
          <button
            ref={cancelButtonRef}
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-colors"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles.bg} ${styles.hoverBg} ${styles.ring} ${themeColor === 'rose' ? 'animate-pulse' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
