import { Link } from 'react-router-dom'
import { Facebook, Youtube, Mail, Phone } from 'lucide-react'
import { useLanguage } from '@context/LanguageContext'

const Footer = ({ compact = false }) => {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  if (compact) {
    return (
      <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
          <p className="text-xs sm:text-sm text-center text-gray-400">
            &copy; {currentYear} Food Shop. All rights reserved.
          </p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Food Shop</h3>
            <p className="text-sm leading-relaxed">
              Discover amazing restaurants and delicious food near you. 
              Connect directly with restaurant owners for the best experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('common.restaurants')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/restaurants" className="hover:text-white transition">
                  {t('restaurant.title')}
                </Link>
              </li>
              <li>
                <Link to="/restaurants/search" className="hover:text-white transition">
                  {t('restaurant.search')}
                </Link>
              </li>
              <li>
                <Link to="/food-items" className="hover:text-white transition">
                  {t('food.title')}
                </Link>
              </li>
              <li>
                <Link to="/food-categories" className="hover:text-white transition">
                  {t('common.categories')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('owner.title')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/owner/register" className="hover:text-white transition">
                  {t('auth.registerTitle')}
                </Link>
              </li>
              <li>
                <Link to="/owner/login" className="hover:text-white transition">
                  {t('auth.loginTitle')}
                </Link>
              </li>
              <li>
                <Link to="/owner/restaurant/register" className="hover:text-white transition">
                  {t('owner.addRestaurant')}
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-white transition">
                  {t('common.news')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <span>contact@foodshop.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+1 234 567 890</span>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-4">
              <a href="#" className="hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-white transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {currentYear} Food Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
