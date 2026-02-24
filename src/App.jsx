import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Context Providers
import { AuthProvider } from '@context/AuthContext'
import { LanguageProvider } from '@context/LanguageContext'

// Layouts
import MainLayout from '@components/layouts/MainLayout'
import OwnerLayout from '@components/layouts/OwnerLayout'
import AdminLayout from '@components/layouts/AdminLayout'

// Public Pages
import HomePage from '@pages/public/HomePage'
import RestaurantListPage from '@pages/public/RestaurantListPage'
import RestaurantSearchPage from '@pages/public/RestaurantSearchPage'
import RestaurantDetailPage from '@pages/public/RestaurantDetailPage'
import FoodListPage from '@pages/public/FoodListPage'
import FoodDetailPage from '@pages/public/FoodDetailPage'
import FoodCategoryListPage from '@pages/public/FoodCategoryListPage'
import FoodCategoryDetailPage from '@pages/public/FoodCategoryDetailPage'
import NewsListPage from '@pages/public/NewsListPage'
import NewsDetailPage from '@pages/public/NewsDetailPage'

// Owner Pages
import OwnerRegisterPage from '@pages/owner/OwnerRegisterPage'
import OwnerLoginPage from '@pages/owner/OwnerLoginPage'
import OwnerDashboardPage from '@pages/owner/OwnerDashboardPage'
import OwnerProfilePage from '@pages/owner/OwnerProfilePage'
import RestaurantRegisterPage from '@pages/owner/RestaurantRegisterPage'
import RestaurantEditPage from '@pages/owner/RestaurantEditPage'
import OwnerRestaurantDetailPage from '@pages/owner/OwnerRestaurantDetailPage'
import FoodItemCreatePage from '@pages/owner/FoodItemCreatePage'
import FoodItemEditPage from '@pages/owner/FoodItemEditPage'
import OwnerFoodDetailPage from '@pages/owner/OwnerFoodDetailPage'

// Admin Pages
import AdminLoginPage from '@pages/admin/AdminLoginPage'
import AdminDashboardPage from '@pages/admin/AdminDashboardPage'
import AdminRestaurantListPage from '@pages/admin/AdminRestaurantListPage'
import AdminFoodItemListPage from '@pages/admin/AdminFoodItemListPage'
import CategoryCreatePage from '@pages/admin/CategoryCreatePage'
import CategoryEditPage from '@pages/admin/CategoryEditPage'
import CategoryManagementPage from '@pages/admin/CategoryManagementPage'
import NewsCreatePage from '@pages/admin/NewsCreatePage'
import AdminNewsListPage from '@pages/admin/AdminNewsListPage'
import NewsEditPage from '@pages/admin/NewsEditPage'

// Components
import ProtectedRoute from '@components/common/ProtectedRoute'
import NotFoundPage from '@pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurants" element={<RestaurantListPage />} />
            <Route path="/restaurants/search" element={<RestaurantSearchPage />} />
            <Route path="/restaurants/:restaurantId/food-items/:id" element={<FoodDetailPage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
            
            <Route path="/food-items" element={<FoodListPage />} />
            <Route path="/food-items/:id" element={<FoodDetailPage />} />
            
            <Route path="/food-categories" element={<FoodCategoryListPage />} />
            <Route path="/food-categories/:id" element={<FoodCategoryDetailPage />} />
            
            <Route path="/news" element={<NewsListPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
          </Route>

          {/* Owner Auth Routes */}
          <Route path="/owner/register" element={<OwnerRegisterPage />} />
          <Route path="/owner/login" element={<OwnerLoginPage />} />

          {/* Protected Owner Routes */}
          <Route element={<ProtectedRoute role="owner" />}>
            <Route element={<OwnerLayout />}>
              <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
              <Route path="/owner/profile" element={<OwnerProfilePage />} />
              <Route path="/owner/restaurant/register" element={<RestaurantRegisterPage />} />
              <Route path="/owner/restaurant/:id/edit" element={<RestaurantEditPage />} />
              <Route path="/owner/restaurant/:id" element={<OwnerRestaurantDetailPage />} />
              <Route path="/owner/restaurant/:restaurantId/food-items/create" element={<FoodItemCreatePage />} />
              <Route path="/owner/restaurant/:restaurantId/food-items/:id" element={<OwnerFoodDetailPage />} />
              <Route path="/owner/food-items/:id/edit" element={<FoodItemEditPage />} />
            </Route>
          </Route>

          {/* Admin Auth Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/restaurants" element={<AdminRestaurantListPage />} />
              <Route path="/admin/restaurants/:id/food-items" element={<AdminFoodItemListPage />} />
              <Route path="/admin/categories" element={<CategoryManagementPage />} />
              <Route path="/admin/categories/create" element={<CategoryCreatePage />} />
              <Route path="/admin/categories/:id/edit" element={<CategoryEditPage />} />
              <Route path="/admin/news" element={<AdminNewsListPage />} />
              <Route path="/admin/news/create" element={<NewsCreatePage />} />
              <Route path="/admin/news/:id/edit" element={<NewsEditPage />} />
            </Route>
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
