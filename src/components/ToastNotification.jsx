import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className={`toast-banner ${toast.type || 'info'}`} role="alert">
      <div className="toast-icon-wrap">
        {isSuccess && <CheckCircle2 size={18} className="text-success" />}
        {isError && <AlertCircle size={18} className="text-danger" />}
        {!isSuccess && !isError && <Info size={18} className="text-primary" />}
      </div>
      
      <div className="toast-body">
        {toast.title && <h5 className="toast-title">{toast.title}</h5>}
        <p className="toast-message">{toast.message}</p>
      </div>

      <button 
        type="button" 
        className="toast-close-btn" 
        onClick={onClose}
        title="Tutup Notifikasi"
      >
        <X size={14} />
      </button>
    </div>
  );
}
