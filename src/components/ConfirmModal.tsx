import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans cursor-pointer"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-black/60 border border-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden cursor-default"
          >
            <div className="p-8">
              <p className="text-lg font-bold text-center text-white uppercase tracking-wide">
                {message}
              </p>
            </div>
            <div className="flex border-t border-white/10 bg-black/40">
              <button
                onClick={onCancel}
                className="flex-1 py-4 text-sm font-bold text-white/50 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest border-r border-white/10"
              >
                {t('no')}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-4 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors uppercase tracking-widest"
              >
                {t('yes')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
