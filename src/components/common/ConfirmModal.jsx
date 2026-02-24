import { AlertTriangle, X } from 'lucide-react'
import { useLanguage } from '@context/LanguageContext'

/**
 * Confirm Modal Component
 * Usage:
 *   const [showConfirm, setShowConfirm] = useState(false)
 *   const handleConfirm = () => { ... }
 *   <ConfirmModal
 *     isOpen={showConfirm}
 *     onClose={() => setShowConfirm(false)}
 *     onConfirm={handleConfirm}
 *     title="Confirm Delete"
 *     message="Are you sure?"
 *   />
 */
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant = 'danger' }) => {
  const { t } = useLanguage()
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const variantClasses = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-600',
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: 'text-amber-600',
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: 'text-blue-600',
    },
  }

  const variantStyle = variantClasses[variant] || variantClasses.danger

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 ${variantStyle.icon}`}>
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              {cancelText || t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`btn ${variantStyle.button}`}
            >
              {confirmText || t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
