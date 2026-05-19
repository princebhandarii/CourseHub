import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, BarChart3, Settings,
  GraduationCap, LogOut, Menu, X, ChevronLeft, ChevronRight, Sun, Moon
} from 'lucide-react';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/admin/courses',   icon: BookOpen,         label: 'Courses'       },
  { to: '/admin/users',     icon: Users,            label: 'Users'         },
  { to: '/admin/analytics', icon: BarChart3,        label: 'Analytics'     },
  { to: '/admin/settings',  icon: Settings,         label: 'Settings'      },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const SidebarContent = ({ mobile }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white dark:text-gray-900" />
        </div>
        {!collapsed && <span className="font-bold text-lg">CourseHub</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? label : ''}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + logout */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <button onClick={toggle} className={`sidebar-item w-full ${collapsed ? 'justify-center px-0' : ''}`} title={collapsed ? 'Toggle theme' : ''}>
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className={`sidebar-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center px-0' : ''}`} title={collapsed ? 'Logout' : ''}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 relative`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 bg-white dark:bg-gray-900 h-full flex flex-col animate-slide-in">
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setMobileOpen(true)} className="md:hidden btn-ghost p-2">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h2 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Admin Panel</h2>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Link to="/" className="btn-ghost text-xs gap-1.5">
              <GraduationCap className="w-4 h-4" /> View Site
            </Link>
            <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
