import { createPortal } from 'react-dom';

export default function Modal({ children, onClose }) {
  return createPortal(
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in-up" 
      style={{ animationDuration: '0.2s' }}
      onClick={onClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-scale-in my-8 max-h-[90vh] overflow-y-auto border border-white/50"
        style={{ animationDuration: '0.3s', animationDelay: '0.05s' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
