import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoutingDiagnostic() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();

  useEffect(() => {
    console.log('🔍 Routing Diagnostic Page Loaded');
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-purple-100 to-pink-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-900 mb-6">🔍 Routing Diagnostic</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Current State</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-700 min-w-[150px]">Current URL:</span>
              <span className="text-blue-600 font-mono">{location.pathname}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-700 min-w-[150px]">User:</span>
              <span className="text-gray-900">{user?.username || 'Not logged in'}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-700 min-w-[150px]">Email:</span>
              <span className="text-gray-900">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-700 min-w-[150px]">Is Super Admin:</span>
              <span className={`font-bold ${isSuperAdmin() ? 'text-green-600' : 'text-red-600'}`}>
                {isSuperAdmin() ? 'YES ✅' : 'NO ❌'}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-700 min-w-[150px]">User Role:</span>
              <span className="text-gray-900">{user?.role || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Layout Detection</h2>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">Which Layout is Rendering?</p>
              <p className="text-sm text-blue-700">
                Check the browser console to see which layout logs are appearing:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>🔵 Blue circles = AdminLayout (correct for /super-admin)</li>
                <li>⚪ White circles = Main Layout (wrong for /super-admin)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Navigation Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/super-admin')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Go to /super-admin
            </button>
            <button
              onClick={() => navigate('/super-admin/test')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Go to /super-admin/test
            </button>
            <button
              onClick={() => navigate('/super-admin/users')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Go to /super-admin/users
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Go to /dashboard
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-900 mb-3">Expected Behavior</h3>
          <ul className="space-y-2 text-yellow-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">✓</span>
              <span>When on /super-admin routes, you should see a <strong>DARK GRAY/BLACK sidebar</strong> (AdminLayout)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">✓</span>
              <span>The sidebar should say <strong>"FinanceGrowth - Super Admin"</strong> at the top</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">✓</span>
              <span>When on other routes like /dashboard, you should see the <strong>WHITE sidebar</strong> (Main Layout)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">✓</span>
              <span>Check browser console for 🔵 (AdminLayout) vs ⚪ (Main Layout) logs</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
