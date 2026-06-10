import { Trash, RocketLaunch } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import Modal from './Modal'
import Button from './Button'

export type ConfirmVariant = 'danger' | 'primary'

export interface ConfirmDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  itemName?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  variant?: ConfirmVariant
  icon?: ReactNode
  hideCancel?: boolean
}

const variantStyles: Record<
  ConfirmVariant,
  { bg: string; gradient: string; defaultIcon: ReactNode }
> = {
  danger: {
    bg: 'bg-red-100',
    gradient: 'linear-gradient(to right, #DC2626, #B91C1C)',
    defaultIcon: <Trash size={24} className="text-red-600" weight="bold" />,
  },
  primary: {
    bg: 'bg-[#A8EDFF]',
    gradient: 'linear-gradient(to right, #2c1452, #2c1452)',
    defaultIcon: <RocketLaunch size={24} className="text-[#2c1452]" weight="bold" />,
  },
}

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  message,
  itemName,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger',
  icon,
  hideCancel = false,
}: ConfirmDeleteModalProps) => {
  const description =
    message ??
    (itemName
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      : 'Are you sure you want to delete this item? This action cannot be undone.')

  const styles = variantStyles[variant]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          {!hideCancel && (
            <Button
              variant="white"
              className="!h-10"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant="primary"
            className="!h-10"
            onClick={onConfirm}
            loading={loading}
            style={{
              background: styles.gradient,
              boxShadow: '0px 10px 20px 0px rgba(0, 0, 0, 0.10)',
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${styles.bg}`}
        >
          {icon ?? styles.defaultIcon}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed pt-2">{description}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDeleteModal
