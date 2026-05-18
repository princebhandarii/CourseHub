import { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, DollarSign, Star, Award } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminService } from '../../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS  = ['#111827','#374151','#6B7280','#9CA3AF','#D1D5DB','#F3F4F6'];

function StatCard({ icon: Icon, label, value, sub, color = 'bg-gray-100 dark:bg-gray-800' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-black">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.dashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
      </div>
    </div>
  );

  const { stats, monthlyEnrollments, topCourses, recentUsers, categoryStats } = data || {};

  // Format monthly data for charts
  const chartData = monthlyEnrollments?.map(m => ({
    name:        MONTHS[(m._id.month - 1)],
    enrollments: m.count,
    revenue:     m.revenue,
  })) || [];

  const pieData = categoryStats?.map(c => ({ name: c._id || 'Other', value: c.count })) || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}      label="Total Students"  value={stats?.totalUsers?.toLocaleString() || 0}       sub="Active learners" />
        <StatCard icon={BookOpen}   label="Total Courses"   value={stats?.totalCourses?.toLocaleString() || 0}     sub="In catalog" />
        <StatCard icon={TrendingUp} label="Enrollments"     value={stats?.totalEnrollments?.toLocaleString() || 0} sub="All time" />
        <StatCard icon={DollarSign} label="Total Revenue"   value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} sub="Lifetime earnings" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Enrollment line chart */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Enrollments (Last 6 Months)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="enrollments" stroke="#111827" strokeWidth={2} dot={{ fill: '#111827', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>

        {/* Revenue bar chart */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Revenue (₹) — Last 6 Months</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>

        {/* Category pie chart */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Courses by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No courses yet</div>}
        </div>

        {/* Top courses */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Top Courses by Enrollment</h3>
          <div className="space-y-3">
            {topCourses?.length > 0 ? topCourses.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                  {item.course?.thumbnail
                    ? <img  src={`https://coursehub-b7gs.onrender.com${item.course.thumbnail}`} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-gray-400" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.course?.title}</p>
                  <p className="text-xs text-gray-400">{item.enrollments} students</p>
                </div>
                <span className="text-xs font-semibold">₹{(item.course?.price || 0).toLocaleString()}</span>
              </div>
            )) : <p className="text-sm text-gray-400">No enrollments yet.</p>}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4">Recent Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100 dark:border-gray-800">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentUsers?.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-500">{u.email}</td>
                  <td className="py-2.5 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
