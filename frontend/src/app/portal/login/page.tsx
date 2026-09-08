'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For now, this is a placeholder for authentication
      // In production, this would call the Django authentication API
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token and redirect to dashboard
        localStorage.setItem('customer_token', data.token);
        window.location.href = '/portal/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <span className="text-3xl">💧</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
            <p className="text-gray-600 mt-2">Spencer Water Services</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/portal/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-4">
              Don't have portal access?
            </p>
            <p className="text-center text-xs text-gray-500">
              Contact Spencer Water Services to activate your customer portal account.
            </p>
            <div className="mt-4 text-center">
              <Link href="/contact" className="text-sm text-blue-600 hover:text-blue-700">
                Contact Support
              </Link>
            </div>
          </div>

          {/* Back to Website */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Website
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Spencer Water Services Ltd</p>
        </div>
      </div>
    </div>
  );
}
