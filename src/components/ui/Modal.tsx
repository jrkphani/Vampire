// Re-export from the shadcn/ui dialog implementation
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

// Export types for TypeScript
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Create Modal wrapper for backward compatibility
import React from 'react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      {title && (
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
      )}
      {children}
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  </Dialog>
);

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
  message: string;
  children?: React.ReactNode;
}

export interface AlertModalProps extends ModalProps {
  variant?: 'danger' | 'warning' | 'info';
  message: string;
}

// Basic Modal components

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant = 'warning',
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{message}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={variant === 'danger' ? 'destructive' : 'default'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  variant = 'info',
}) => {
  // Use variant for potential styling but it doesn't affect functionality yet
  console.log('AlertModal variant:', variant);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
