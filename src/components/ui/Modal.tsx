import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    closeOnOutsideClick?: boolean;
    closeOnEsc?: boolean;
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnOutsideClick = false,
    closeOnEsc = true
}: ModalProps) => {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEsc) onClose();
        };
        const handleGlobalClick = (e: MouseEvent) => {
            console.log('Global click detected while modal open:', {
                target: e.target,
                currentTarget: e.currentTarget,
                modalOpen: isOpen,
                closeOnOutsideClick
            });
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('click', handleGlobalClick, true); // Use capture phase
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleGlobalClick, true);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, closeOnEsc, closeOnOutsideClick]);

    if (!isOpen) return null;

    const sizes = {
        sm: '400px',
        md: '500px',
        lg: '700px'
    };

    return (
        <div
            className="modal-overlay-wrapper"
            onClick={(e) => {
                const isOverlay = e.target === e.currentTarget;
                console.log('Modal wrapper click:', { isOverlay, closeOnOutsideClick, target: (e.target as any).className });
                if (isOverlay) {
                    if (closeOnOutsideClick) {
                        onClose();
                    } else {
                        console.log('Closure prevented by closeOnOutsideClick=false');
                    }
                }
            }}
        >
            <div
                className="modal"
                style={{ maxWidth: sizes[size] }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-icon"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'primary' | 'danger';
}

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    confirmVariant = 'primary'
}: ConfirmModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className={`btn btn-${confirmVariant}`}
                        onClick={() => { onConfirm(); onClose(); }}
                    >
                        {confirmText}
                    </button>
                </>
            }
        >
            <p>{message}</p>
        </Modal>
    );
};
