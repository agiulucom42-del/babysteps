
import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  closeAriaLabel?: string;
  themeColor?: 'sky' | 'rose';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  closeAriaLabel = 'Close',
  themeColor = 'sky',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const themeClasses = {
    sky: {
      border: 'border-sky-400',
      bg: 'bg-sky-100',
      text: 'text-sky-600',
      focusRing: 'focus-visible:ring-sky-400',
      focusRingOffset: 'focus:ring-offset-2 focus:ring-sky-400',
    },
    rose: {
      border: 'border-rose-400',
      bg: 'bg-rose-100',
      text: 'text-rose-600',
      focusRing: 'focus-visible:ring-rose-400',
      focusRingOffset: 'focus:ring-offset-2 focus:ring-rose-400',
    },
  };

  const currentTheme = themeClasses[themeColor] || themeClasses.sky;

  useEffect(() => {
    if (!isOpen) return;

    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = [
          closeButtonRef.current,
          cancelButtonRef.current,
          confirmButtonRef.current,
        ].filter(Boolean) as HTMLElement[];

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift+Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogTitle"
      aria-describedby="dialogDesc"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl w-full max-w-sm border-t-4 ${currentTheme.border}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="p-6">
          <div className="flex items-start">
            <div className={`mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${currentTheme.bg}`}>
              <AlertTriangle className={`h-6 w-6 ${currentTheme.text}`} aria-hidden="true" />
            </div>
            <div className="flex-grow">
              <h2 id="dialogTitle" className="text-lg font-bold text-slate-800">
                {title}
              </h2>
              <p id="dialogDesc" className="mt-2 text-sm text-slate-600">
                {message}
              </p>
            </div>
             <button
              ref={closeButtonRef}
              onClick={onClose}
              className={`text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 -mt-2 -mr-2 focus:outline-none focus-visible:ring-2 ${currentTheme.focusRing}`}
              aria-label={closeAriaLabel}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            type="button"
            className={`px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 ${currentTheme.focusRingOffset} transition-all`}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            type="button"
            className={`px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
