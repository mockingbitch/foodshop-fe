import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { categoryApi } from '@services/api/categoryApi'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ConfirmModal from '@components/common/ConfirmModal'
import { getLocalizedText } from '@utils/helpers'
import { FolderTree, Search, Edit, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const PER_PAGE = 10

const getPaginationMeta = (res, listLength = 0) => {
  const root = res?.data ?? res
  if (!root || typeof root !== 'object') {
    return { currentPage: 1, lastPage: 1, total: listLength, perPage: PER_PAGE }
  }
  let payload
  if (
    root.data &&
    typeof root.data === 'object' &&
    !Array.isArray(root.data) &&
    (root.data.current_page != null || root.data.last_page != null || root.data.total != null)
  ) {
    payload = root.data
  } else {
    payload = root
  }
  const meta = payload.meta ?? payload.pagination ?? payload
  const currentPage = Number(meta.current_page ?? meta.page ?? meta.currentPage ?? 1) || 1
  const total = Number(meta.total) >= 0 ? Number(meta.total) : listLength
  const perPage = Number(meta.per_page ?? meta.perPage ?? PER_PAGE) || PER_PAGE
  let lastPage = Number(meta.last_page ?? meta.lastPage ?? meta.total_pages ?? meta.totalPages ?? 0) || 0
  if (lastPage < 1 && total > 0 && perPage > 0) lastPage = Math.ceil(total / perPage)
  return {
    currentPage,
    lastPage: lastPage >= 1 ? lastPage : 1,
    total,
    perPage,
  }
}

const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.categories ?? value.items ?? value.results ?? value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.categories ?? raw.items ?? raw.results ?? raw.list
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const DEBOUNCE_MS = 350

const CategoryManagementPage = () => {
  const { t, currentLanguage } = useLanguage()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: PER_PAGE })
  const [deleting, setDeleting] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const params = { per_page: PER_PAGE, page }
      if (searchQuery?.trim()) params.search = searchQuery.trim()
      const res = await categoryApi.getCategories(params)
      const raw = res?.data ?? res
      const list = ensureArray(raw)
      setCategories(Array.isArray(list) ? list : [])
      setPagination(getPaginationMeta(res, Array.isArray(list) ? list.length : 0))
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
      setPagination({ currentPage: 1, lastPage: 1, total: 0, perPage: PER_PAGE })
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories()
    }, searchQuery ? DEBOUNCE_MS : 0)
    return () => clearTimeout(timer)
  }, [searchQuery, page, fetchCategories])

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const handleDeleteClick = (id, name) => {
    setItemToDelete({ id, name })
    setShowConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    const { id } = itemToDelete
    setDeleting(id)
    try {
      await categoryApi.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => (c.id ?? c.category_id) !== id))
      toast.success(t('common.success'))
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(t('common.error'))
    } finally {
      setDeleting(null)
      setItemToDelete(null)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.manageCategories')}</h1>
        <Link
          to="/admin/categories/create"
          className="btn btn-primary inline-flex items-center gap-2 shrink-0"
        >
          <Plus size={20} />
          {t('common.add')}
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
            placeholder={t('common.search')}
          />
        </div>
      </div>

      {/* Category List */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-8 text-center">
          <FolderTree size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link to="/admin/categories/create" className="btn btn-primary">
            {t('common.add')} {t('common.categories')}
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">#</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">{t('common.categories')}</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">{t('food.category')}</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat, index) => {
                  const id = cat.id ?? cat.category_id
                  const name = getLocalizedText(cat.name, currentLanguage)
                  const isDeleting = deleting === id
                  const rowNum = (pagination.currentPage - 1) * pagination.perPage + index + 1
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{rowNum}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{name || t('common.noData')}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {cat.parent_id ? getLocalizedText(cat.parent?.name, currentLanguage) || `#${cat.parent_id}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/categories/${id}/edit`}
                            className="btn btn-outline text-sm inline-flex items-center gap-1"
                          >
                            <Edit size={16} />
                            {t('common.edit')}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(id, name)}
                            disabled={isDeleting}
                            className="btn btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50 inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                            {t('common.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && categories.length > 0 && pagination.total > PER_PAGE && (
        <nav
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6"
          aria-label="Pagination"
        >
          <p className="text-sm text-gray-600 order-2 sm:order-1">
            {t('common.showing')}{' '}
            <span className="font-medium">{Math.min((pagination.currentPage - 1) * pagination.perPage + 1, pagination.total)}</span>–
            <span className="font-medium">{Math.min(pagination.currentPage * pagination.perPage, pagination.total)}</span>{' '}
            {t('common.of')} <span className="font-medium">{pagination.total}</span>
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.currentPage <= 1}
              className="btn btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('common.previous')}
            >
              <ChevronLeft size={18} />
              {t('common.previous')}
            </button>
            <span className="text-sm text-gray-700 px-3 py-1.5 bg-white border border-gray-200 rounded min-w-[80px] text-center">
              {t('common.page')} {pagination.currentPage} / {pagination.lastPage}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.lastPage, p + 1))}
              disabled={pagination.currentPage >= pagination.lastPage}
              className="btn btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('common.next')}
            >
              {t('common.next')}
              <ChevronRight size={18} />
            </button>
          </div>
        </nav>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false)
          setItemToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title={t('common.confirmDelete')}
        message={itemToDelete && itemToDelete.name ? `${t('common.confirmDelete')} "${itemToDelete.name}"?` : t('common.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}

export default CategoryManagementPage
