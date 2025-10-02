'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar,
  Settings,
  BarChart3,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Shield,
  Home,
  CheckSquare,
  PlusCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
  Bot
} from 'lucide-react';
import ClientsModule from './ClientsModule';
import CasesModule from './CasesModule';
import DocumentsModule from './DocumentsModule';
import AIDocumentsModule from './AIDocumentsModule';

interface DashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalClients: number;
  activeCases: number;
  monthlyRevenue: number;
  successRate: number;
  recentCases: Array<{
    id: string;
    claimNumber?: string;
    client: string;
    status: string;
    statusColor: string | null;
    insuranceCompany: string;
    value: string;
    date: string;
  }>;
}

export default function SecuroHelpDashboard({ onLogout }: DashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCaseForDocuments, setSelectedCaseForDocuments] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeCases: 0,
    monthlyRevenue: 0,
    successRate: 0,
    recentCases: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  console.log('🔍 Current activeView:', activeView);

  // Fetch real dashboard data
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/dashboard/stats', {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('Failed to fetch dashboard stats');
        }
      } catch (error) {
        console.error('Dashboard stats error:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (activeView === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeView]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Klienci', icon: Users },
    { id: 'cases', label: 'Sprawy', icon: Briefcase },
    { id: 'documents', label: 'Dokumenty', icon: FileText },
    { id: 'ai-documents', label: 'Dokumenty AI', icon: Bot },
    { id: 'tasks', label: 'Zadania', icon: CheckSquare },
    { id: 'calendar', label: 'Kalendarz', icon: Calendar },
    { id: 'reports', label: 'Raporty', icon: BarChart3 },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
  ];

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    documents: 'bg-amber-500',
    sent: 'bg-violet-500',
    positive: 'bg-emerald-500',
    negative: 'bg-red-500',
    appeal: 'bg-orange-500',
    lawsuit: 'bg-red-600',
    closed: 'bg-gray-500'
  };

  const statusLabels: Record<string, string> = {
    new: 'Nowa',
    documents: 'Dokumenty',
    sent: 'Wysłane do TU',
    positive: 'Pozytywna',
    negative: 'Negatywna',
    appeal: 'Odwołanie',
    lawsuit: 'Pozew',
    closed: 'Zakończona'
  };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 h-screen`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Securo Help</h1>
                <p className="text-xs text-gray-500">System Kancelarii</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium">JK</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Jan Kowalski</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen" style={{marginLeft: '256px'}}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6 text-gray-500" />
              </button>
              
              {/* Search */}
              <div className="relative w-96 hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj klientów, spraw, dokumentów..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Nowa sprawa</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Logout */}
              <button 
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              {/* Page Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                <p className="text-gray-500">Przegląd najważniejszych informacji</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Liczba klientów</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalClients}</p>
                      <p className="text-xs text-emerald-600 mt-2 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12% vs poprzedni miesiąc
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Aktywne sprawy</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeCases}</p>
                      <p className="text-xs text-gray-500 mt-2">21 w tym miesiącu</p>
                    </div>
                    <div className="h-12 w-12 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-violet-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Przychody (miesiąc)</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stats.monthlyRevenue.toLocaleString('pl-PL')} zł
                      </p>
                      <p className="text-xs text-emerald-600 mt-2 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +23% vs poprzedni miesiąc
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Skuteczność</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.successRate}%</p>
                      <p className="text-xs text-gray-500 mt-2">Pozytywne decyzje</p>
                    </div>
                    <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Cases Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ostatnie sprawy</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Numer sprawy
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Numer szkody
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Towarzystwo
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Klient
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wartość
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {statsLoading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <span className="text-gray-500">Ładowanie...</span>
                          </td>
                        </tr>
                      ) : stats.recentCases.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center">
                            <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-gray-500">Brak najnowszych spraw</span>
                          </td>
                        </tr>
                      ) : (
                        stats.recentCases.map((case_) => (
                        <tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {case_.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {case_.claimNumber || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {case_.insuranceCompany}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {case_.client}
                            </span>
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: case_.statusColor || '#6B7280' }}
                            >
                              {case_.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {case_.value}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {case_.date}
                            </span>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Zadania na dziś</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-red-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">Złożyć odwołanie - sprawa #00039</p>
                        <p className="text-xs text-gray-500">Termin: dziś, 15:00</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-amber-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">Kontakt z klientem - Anna Nowak</p>
                        <p className="text-xs text-gray-500">Termin: dziś, 17:00</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Ważne terminy</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">Rozprawa sądowa</p>
                          <p className="text-xs text-gray-500">25 marca, 10:00</p>
                        </div>
                      </div>
                      <span className="text-xs text-red-600 font-medium">Za 3 dni</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Statystyki tygodnia</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Nowe sprawy</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">7</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Zakończone sprawy</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'clients' && (
            <ClientsModule />
          )}

              {activeView === 'cases' && (
                <CasesModule 
                  onNavigateToDocuments={(caseNumber) => {
                    setSelectedCaseForDocuments(caseNumber);
                    setActiveView('documents');
                  }}
                />
              )}

      {activeView === 'documents' && (
        <DocumentsModule 
          preselectedCaseNumber={selectedCaseForDocuments}
          onClearCaseFilter={() => setSelectedCaseForDocuments(undefined)}
        />
      )}

      {activeView === 'ai-documents' && (
        <AIDocumentsModule 
          preselectedCaseNumber={selectedCaseForDocuments}
          onClearCaseFilter={() => setSelectedCaseForDocuments(undefined)}
        />
      )}

          {/* Other views */}
          {activeView !== 'dashboard' && activeView !== 'clients' && activeView !== 'cases' && activeView !== 'documents' && activeView !== 'ai-documents' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{activeView}</h2>
                <p className="text-gray-500">Sekcja w przygotowaniu</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Moduł w budowie</p>
                    <p className="text-sm text-gray-400 mt-2">Ta funkcjonalność zostanie wkrótce dodana</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}