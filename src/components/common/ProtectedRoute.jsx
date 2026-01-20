import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/owner/login'} replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
