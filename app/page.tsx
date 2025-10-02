'use client'

import SecuroLoginPage from '../src/components/SecuroLoginPage'
import SecuroHelpDashboard from '../src/components/SecuroHelpDashboard'
import { AuthProvider, useAuth } from '../src/contexts/AuthContext'

function AppContent() {
  const { loading, logout, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SecuroLoginPage onLogin={async () => {
      // Login logic is handled in the login component via context
      // This callback is mainly for UI state updates
    }} />
  }

      return <SecuroHelpDashboard onLogout={logout} />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}