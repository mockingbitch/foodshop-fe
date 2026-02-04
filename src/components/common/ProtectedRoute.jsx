import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { hasToken } from '@utils/authToken'
import { OWNER_ROLES } from '@constants'

/**
 * Guard: token trong memory hoặc session từ HttpOnly cookie (isAuthenticated từ /auth/me).
 * role "owner" chấp nhận cả user.role === 'owner' và 'restaurant_owner'.
 */
const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const tokenOrCookie = hasToken() || isAuthenticated

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!tokenOrCookie) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/owner/login'} replace />
  }

  // Có token nhưng user chưa load xong từ /auth/me → chờ, không redirect về /
  if (role && user == null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (role === 'owner') {
    if (!OWNER_ROLES.includes(user?.role)) {
      return <Navigate to="/" replace />
    }
  } else if (role && user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
