import { Outlet } from 'react-router-dom'
import Header from '@components/common/Header'
import OwnerSidebar from '@components/owner/OwnerSidebar'

const OwnerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <OwnerSidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default OwnerLayout
