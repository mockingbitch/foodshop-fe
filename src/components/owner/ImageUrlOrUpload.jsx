import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { uploadApi } from '@services/api/uploadApi'
import { getImageUrlFromUploadResponse, getImageUrl } from '@utils/helpers'
import LoadingSpinner from '@components/common/LoadingSpinner'

/**
 * Input URL hoặc Upload ảnh. Khi gửi form, parent nhận cả url và type ('url' | 'upload').
 */
const ImageUrlOrUpload = ({
  name,
  value = '',
  onChange,
  onTypeChange,
  label,
  placeholder,
  uploadType = 'restaurant',
  disabled,
  t = (k) => k,
}) => {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleUrlChange = (e) => {
    onChange?.(e.target.value)
    onTypeChange?.('url')
  }

  const handleUpload = async (e) => {
    const file = e?.target?.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const res = await uploadApi.uploadImages(file, uploadType)
      const url = getImageUrlFromUploadResponse(res)
      if (url) {
        onChange?.(url)
        onTypeChange?.('upload')
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
    e.target.value = ''
  }

  const imgSrc = value ? (value.startsWith('http') ? value : getImageUrl(value)) : null

  return (
    <div className="space-y-1">
      {label && <label className="block text-xs text-gray-600 mb-0.5">{label}</label>}
      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="url"
          name={name}
          value={value}
          onChange={handleUrlChange}
          className="input flex-1 min-w-[120px] text-sm"
          placeholder={placeholder}
          disabled={disabled}
        />
        <span className="text-xs text-gray-400 shrink-0">{t('common.or')}</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={disabled || uploading}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
          className="btn btn-outline py-2 px-3 text-sm shrink-0 inline-flex items-center gap-1.5"
        >
          {uploading ? <LoadingSpinner /> : <ImagePlus size={16} />}
          {uploading ? t('common.loading') : t('common.upload')}
        </button>
      </div>
      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          className="h-16 w-auto max-w-full object-contain rounded border border-gray-200 mt-1"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      )}
    </div>
  )
}

export default ImageUrlOrUpload
