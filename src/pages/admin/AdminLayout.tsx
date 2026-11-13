import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'

export default function AdminLayout() {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  )
}
