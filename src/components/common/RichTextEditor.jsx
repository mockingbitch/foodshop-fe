import { useRef, useMemo } from 'react'
import ReactQuill from 'react-quill-new'
import { uploadApi } from '@services/api/uploadApi'
import { getImageUrl } from '@utils/helpers'
import { toast } from 'react-toastify'
import 'react-quill-new/dist/quill.snow.css'

const DEFAULT_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'indent',
  'link', 'image',
]

function getImageUrlFromResponse(res) {
  const data = res?.data ?? res
  if (Array.isArray(data)) return data[0]
  const urls = data?.urls ?? data?.images
  if (Array.isArray(urls) && urls[0]) return urls[0]
  const inner = data?.data
  if (inner && typeof inner === 'object') {
    const arr = inner?.urls ?? inner?.images
    if (Array.isArray(arr) && arr[0]) return arr[0]
  }
  const first = data?.data?.[0] ?? data?.[0]
  if (first && (typeof first === 'string')) return first
  if (first && typeof first === 'object') return first.url ?? first.path ?? first.src
  return null
}

/**
 * WYSIWYG editor (Quill) - dùng cho trường content dạng HTML.
 * Ảnh chèn qua nút Image sẽ được upload lên server và chèn URL vào content.
 */
const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Nội dung...',
  minHeight = 200,
  quillModules: quillModulesProp,
  quillFormats = DEFAULT_FORMATS,
  /** type gửi lên khi upload ảnh: 'restaurant' | 'food' | 'news' */
  uploadImageType = 'news',
  className = '',
  ...rest
}) => {
  const quillRef = useRef(null)

  const modules = useMemo(() => {
    if (quillModulesProp) return quillModulesProp
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: function imageHandler() {
            const editor = quillRef.current?.getEditor?.()
            if (!editor) return
            const range = editor.getSelection(true)
            const input = document.createElement('input')
            input.setAttribute('type', 'file')
            input.setAttribute('accept', 'image/*')
            input.onchange = async () => {
              const file = input.files?.[0]
              if (!file) return
              try {
                const res = await uploadApi.uploadImages(file, uploadImageType)
                const pathOrUrl = getImageUrlFromResponse(res)
                if (pathOrUrl) {
                  const url = pathOrUrl.startsWith('http') ? pathOrUrl : getImageUrl(pathOrUrl)
                  editor.insertEmbed(range.index, 'image', url)
                  editor.setSelection(range.index + 1)
                } else {
                  toast.error('Không lấy được URL ảnh từ server')
                }
              } catch (err) {
                console.error(err)
                toast.error('Tải ảnh lên thất bại')
              }
              input.value = ''
            }
            input.click()
          },
        },
      },
    }
  }, [quillModulesProp, uploadImageType])

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={quillFormats}
        placeholder={placeholder}
        style={{ minHeight: `${minHeight}px` }}
        {...rest}
      />
      <style>{`
        .rich-text-editor .quill {
          background: #fff;
        }
        .rich-text-editor .ql-container {
          min-height: ${minHeight - 42}px;
          font-size: 1rem;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: #e5e7eb;
        }
        .rich-text-editor .ql-container {
          border-color: #e5e7eb;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor
