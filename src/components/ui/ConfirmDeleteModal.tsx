import { Trash } from '@phosphor-icons/react'
import Modal from './Modal'
import Button from './Button'

interface ConfirmDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  itemName?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
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
}: ConfirmDeleteModalProps) => {
  const description =
    message ??
    (itemName
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      : 'Are you sure you want to delete this item? This action cannot be undone.')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="white" className='!h-10'
            onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant="primary"
            className='!h-10'
            onClick={onConfirm}
            loading={loading}
            style={{
              background: 'linear-gradient(to right, #DC2626, #B91C1C)',
              boxShadow: '0px 10px 20px 0px rgba(0, 0, 0, 0.10)',
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
          <Trash size={24} className="text-red-600" weight="bold" />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed pt-2">{description}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDeleteModal
