import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="glass-card rounded-2xl shadow-2xl w-full max-w-lg m-4 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-black/10 dark:border-white/20">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:bg-black/10 dark:text-slate-400 dark:hover:bg-white/10 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes scale-in {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;