import Sidebar from '@/components/admin/Sidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';
import './admin.css';

export const metadata = {
  title: 'Admin Panel',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="xl:ml-80">
        <AdminNavbar title="Admin Panel" />
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
