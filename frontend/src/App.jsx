import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Navbar   from './components/common/Navbar';
import Footer   from './components/common/Footer';

// Public Pages
import Home         from './pages/Home';
import Courses      from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import About        from './pages/About';
import Contact      from './pages/Contact';
import Login        from './pages/Login';
import Signup       from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import NotFound     from './pages/NotFound';

// User Pages
import MyCourses       from './pages/user/MyCourses';
import WatchCourse     from './pages/user/WatchCourse';
import Wishlist        from './pages/user/Wishlist';
import UserProfile     from './pages/user/UserProfile';
import ContinueLearning from './pages/user/ContinueLearning';

// Admin Pages
import AdminLogin    from './pages/admin/AdminLogin';
import AdminSignup   from './pages/admin/AdminSignup';
import AdminLayout   from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCourses from './pages/admin/ManageCourses';
import AddEditCourse from './pages/admin/AddEditCourse';
import ManageUsers   from './pages/admin/ManageUsers';
import Analytics     from './pages/admin/Analytics';
import AdminSettings from './pages/admin/AdminSettings';

// ─── Route Guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white rounded-full animate-spin" />
  </div>
);

// ─── Public layout wrapper ─────────────────────────────────────────────────────
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
      <Route path="/courses/:id" element={<PublicLayout><CourseDetail /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* User Protected */}
      <Route path="/my-courses" element={<ProtectedRoute><PublicLayout><MyCourses /></PublicLayout></ProtectedRoute>} />
      <Route path="/watch/:courseId/:videoId?" element={<ProtectedRoute><WatchCourse /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><PublicLayout><Wishlist /></PublicLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><PublicLayout><UserProfile /></PublicLayout></ProtectedRoute>} />
      <Route path="/continue-learning" element={<ProtectedRoute><PublicLayout><ContinueLearning /></PublicLayout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/login"  element={<AdminLogin />} />
      <Route path="/admin/signup" element={<AdminSignup />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="courses"   element={<ManageCourses />} />
        <Route path="courses/add"     element={<AddEditCourse />} />
        <Route path="courses/edit/:id" element={<AddEditCourse />} />
        <Route path="users"     element={<ManageUsers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings"  element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white text-sm font-medium',
              duration: 3000,
              style: { borderRadius: '12px', padding: '12px 16px' },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
