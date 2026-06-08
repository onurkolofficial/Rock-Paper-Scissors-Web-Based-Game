import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, title, message, onClose }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans cursor-pointer"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-black/60 border border-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden cursor-default"
          >
            <div className="p-8 text-center flex flex-col items-center">
              <h2 className="text-xl font-display font-black tracking-widest text-red-400 mb-4">{title}</h2>
              <p className="text-sm font-bold text-white/70 uppercase tracking-widest">
                {message}
              </p>
            </div>
            <div className="flex border-t border-white/10 bg-black/40">
              <button
                onClick={onClose}
                className="flex-1 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors uppercase tracking-widest"
              >
                {t('ok')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
