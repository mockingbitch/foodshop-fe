import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency } from '@utils/helpers'
import { UtensilsCrossed, Store, ChevronRight } from 'lucide-react'

const toDisplayText = (val) => {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    const v = val.vn ?? val.vi ?? val.kr ?? val.ko ?? val.en
    if (typeof v === 'string') return v
    const first = Object.values(val).find((x) => typeof x === 'string')
    return first ?? ''
  }
  return String(val)
}

const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.menus ?? value.items ?? value.categories ?? value.food_items ?? value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.menus ?? raw.items ?? raw.categories ?? raw.food_items
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const getItemPrice = (item) => item?.price ?? item?.unit_price ?? 0
const getItemCurrency = (item) => item?.currency_code ?? item?.currency ?? 'VND'

const RestaurantMenuPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    Promise.all([
      restaurantApi.getRestaurantById(id),
      restaurantApi.getRestaurantMenus(id),
    ])
      .then(([resRes, menusRes]) => {
        const rawRes = resRes?.data ?? resRes
        const rest = rawRes?.data ?? rawRes?.restaurant ?? rawRes?.result ?? rawRes
        if (rest && typeof rest === 'object') setRestaurant(rest)
        else setRestaurant(null)

        const rawMenus = menusRes?.data ?? menusRes
        const list = ensureArray(rawMenus)
        setMenus(Array.isArray(list) ? list : [])
      })
      .catch(() => {
        setRestaurant(null)
        setMenus([])
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  const getMenuSections = (menu) => {
    const categories = menu?.categories ?? menu?.sections ?? []
    if (Array.isArray(categories) && categories.length > 0) return categories
    const items = menu?.items ?? menu?.food_items ?? menu?.foodItems ?? []
    if (Array.isArray(items) && items.length > 0) return [{ name: null, items }]
    return []
  }

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center min-h-[320px] items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (notFound || !restaurant) {
    return (
      <div className="container-custom py-12">
        <div className="card p-8 text-center">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link to="/restaurants" className="btn btn-primary">
            {t('restaurant.title')}
          </Link>
        </div>
      </div>
    )
  }

  const restaurantName = toDisplayText(restaurant.name)

  return (
    <div className="container-custom py-8 sm:py-12">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/restaurants" className="hover:text-primary-600">{t('restaurant.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to={`/restaurants/${id}`} className="hover:text-primary-600 truncate max-w-[120px] sm:max-w-[200px]">
          {restaurantName || t('restaurant.detail')}
        </Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700">{t('restaurant.menu')}</span>
      </nav>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          {restaurantName || t('restaurant.detail')}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">{t('restaurant.menu')}</p>
      </div>

      {menus.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">{t('common.noData')}</p>
          <p className="text-sm text-gray-500 mb-4">{t('restaurant.menu')}</p>
          <Link to={`/restaurants/${id}`} className="btn btn-outline">
            {t('restaurant.detail')}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {menus.map((menu, menuIdx) => {
            const sections = getMenuSections(menu)
            const menuName = toDisplayText(menu.name)
            return (
              <section key={menu.id ?? menuIdx} className="card p-4 sm:p-6">
                {menuName && (
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    {menuName}
                  </h2>
                )}
                <div className="space-y-6">
                  {sections.map((section, sectionIdx) => {
                    const sectionName = toDisplayText(section.name)
                    const items = section.items ?? section.food_items ?? section.foodItems ?? []
                    if (items.length === 0) return null
                    return (
                      <div key={section.id ?? sectionIdx}>
                        {sectionName && (
                          <h3 className="text-base font-medium text-gray-800 mb-3">{sectionName}</h3>
                        )}
                        <ul className="space-y-3">
                          {items.map((item, itemIdx) => (
                            <li
                              key={item.id ?? itemIdx}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-gray-100 last:border-0"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-gray-900">
                                  {toDisplayText(item.name)}
                                </span>
                                {(toDisplayText(item.description) || item.serving_size) && (
                                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                    {toDisplayText(item.description) || item.serving_size}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0 text-primary-600 font-semibold">
                                {formatCurrency(getItemPrice(item), getItemCurrency(item))}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <div className="mt-8">
        <Link to={`/restaurants/${id}`} className="btn btn-outline inline-flex items-center gap-2">
          <Store size={18} />
          {t('restaurant.detail')}
        </Link>
      </div>
    </div>
  )
}

export default RestaurantMenuPage
