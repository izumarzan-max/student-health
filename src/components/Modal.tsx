import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Модальді терезені жабу" className="absolute inset-0 bg-ink/20 backdrop-blur-none animate-fadeIn" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`relative card w-full ${sizes[size]} animate-scaleIn max-h-[90vh] overflow-hidden flex flex-col shadow-[0_24px_72px_rgba(20,44,35,0.25)]`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 id="modal-title" className="font-display font-bold text-ink">{title}</h3>
          <button type="button" aria-label="Жабу" onClick={onClose} className="text-ink-muted hover:text-ink transition p-1 rounded-lg hover:bg-primary-light">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 flex-1">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-line bg-cream/40 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Өшіру' }: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Болдырмау</button>
          <button
            className="btn bg-red-600 text-white hover:bg-red-700"
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink leading-relaxed">{message}</p>
    </Modal>
  );
}
