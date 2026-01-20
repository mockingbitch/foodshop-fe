import { Outlet } from 'react-router-dom'
import Header from '@components/common/Header'
import AdminSidebar from '@components/admin/AdminSidebar'

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
