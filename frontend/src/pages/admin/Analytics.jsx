import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.analytics()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const revenueChart = data?.revenueData?.map(d => ({
    name:        MONTHS[d._id.month - 1] + ' ' + String(d._id.year).slice(2),
    revenue:     d.revenue,
    enrollments: d.enrollments,
  })) || [];

  const userChart = data?.userGrowth?.map(d => ({
    name:  MONTHS[d._id.month - 1] + ' ' + String(d._id.year).slice(2),
    users: d.count,
  })) || [];

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
      </div>
    </div>
  );

  const EmptyChart = () => (
    <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
      No data available yet. Enroll some students to see analytics.
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Last 12 months overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue trend */}
        <div className="card p-5">
          <h3 className="font-semibold mb-1">Revenue Trend</h3>
          <p className="text-xs text-gray-400 mb-4">Monthly revenue (₹) over the last 12 months</p>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2.5}
                  dot={{ fill: '#111827', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>

        {/* Enrollments trend */}
        <div className="card p-5">
          <h3 className="font-semibold mb-1">Enrollment Trend</h3>
          <p className="text-xs text-gray-400 mb-4">New enrollments per month</p>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Enrollments']} />
                <Bar dataKey="enrollments" fill="#374151" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>

        {/* User growth */}
        <div className="card p-5">
          <h3 className="font-semibold mb-1">User Growth</h3>
          <p className="text-xs text-gray-400 mb-4">New user registrations per month</p>
          {userChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={userChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'New Users']} />
                <Line type="monotone" dataKey="users" stroke="#6B7280" strokeWidth={2.5}
                  dot={{ fill: '#6B7280', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>

        {/* Combined revenue + enrollments */}
        <div className="card p-5">
          <h3 className="font-semibold mb-1">Revenue vs Enrollments</h3>
          <p className="text-xs text-gray-400 mb-4">Dual-axis comparison</p>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left"  tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left"  type="monotone" dataKey="revenue"     stroke="#111827" strokeWidth={2} name="Revenue (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="enrollments" stroke="#9CA3AF" strokeWidth={2} name="Enrollments" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
      </div>
    </div>
  );
}
