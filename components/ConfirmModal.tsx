
import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  themeColor?: 'rose' | 'sky';
}

const themeClasses = {
  rose: {
    border: 'border-rose-400',
    bgIcon: 'bg-rose-100',
    textIcon: 'text-rose-500',
    bgButton: 'bg-rose-500',
    hoverBgButton: 'hover:bg-rose-600',
    focusRingButton: 'focus:ring-rose-500',
  },
  sky: {
    border: 'border-sky-400',
    bgIcon: 'bg-sky-100',
    textIcon: 'text-sky-500',
    bgButton: 'bg-sky-500',
    hoverBgButton: 'hover:bg-sky-600',
    focusRingButton: 'focus:ring-sky-500',
  },
};


const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  themeColor = 'rose'
}) => {
  if (!isOpen) return null;

  const currentTheme = themeClasses[themeColor] || themeClasses.rose;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border-t-4 ${currentTheme.border}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="p-6 text-center">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${currentTheme.bgIcon} mb-4`}>
            <AlertTriangle className={`h-6 w-6 ${currentTheme.textIcon}`} aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800" id="modal-title">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
        <div className="bg-slate-50 grid grid-cols-2 gap-x-px">
          <button
            type="button"
            className="w-full inline-flex justify-center items-center gap-2 rounded-none border border-transparent bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-0"
            onClick={onCancel}
          >
            <X size={16} />
            İptal
          </button>
          <button
            type="button"
            className={`w-full inline-flex justify-center items-center gap-2 rounded-none border border-transparent px-4 py-3 text-sm font-medium text-white ${currentTheme.bgButton} ${currentTheme.hoverBgButton} focus:outline-none focus:ring-2 ${currentTheme.focusRingButton} focus:ring-offset-0`}
            onClick={onConfirm}
          >
            <Check size={16} />
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
