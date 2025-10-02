'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Edit, 
  Eye, 
  Mail,
  MapPin,
  Calendar,
  MoreVertical,
  UserPlus,
  FileText,
  Briefcase,
  Phone
} from 'lucide-react';
import { ClientWithRelations, ApiResponse } from '@/types/database';
import AddClientModal from './AddClientModal';
import EditClientModal from './EditClientModal';

interface ClientsModuleProps {
  onSelectClient?: (client: ClientWithRelations) => void;
  onClientUpdated?: () => void;
}

export default function ClientsModule({ onSelectClient }: ClientsModuleProps) {
  const [clients, setClients] = useState<ClientWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithRelations | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientWithRelations | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    console.log('🔄 Rozpoczynam odświeżanie listy klientów...');
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/clients?timestamp=${timestamp}`, { cache: 'no-store' }); // <-- DODANA OPCJA WYŁĄCZAJĄCA CACHE
      const data: ApiResponse<ClientWithRelations[]> = await response.json();
      console.log('📥 Otrzymano odpowiedź z /api/clients:', data);
      
      if (data.success && data.data) {
        setClients(data.data);
        console.log('✅ Lista klientów zaktualizowana w stanie komponentu.');
      } else {
        console.error('❌ Błąd w odpowiedzi API przy pobieraniu klientów:', data.error);
      }
    } catch (error) {
      console.error('💥 Błąd sieci podczas pobierania klientów:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Zakończono odświeżanie listy klientów.');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
    
    const matchesCity = !filterCity || client.city === filterCity;
    
    return matchesSearch && matchesCity;
  });

  const uniqueCities = [...new Set(clients.map(client => client.city))];

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pl-PL').format(new Date(date));
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Klienci</h2>
          <p className="text-gray-500">Zarządzaj bazą klientów</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #1e40af)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #1d4ed8)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          <UserPlus className="h-4 w-4" />
          <span>Dodaj klienta</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-slate-200 dark:border-gray-600 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj klientów..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="pl-3 pr-8 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            >
              <option value="">Wszystkie miasta</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: 'linear-gradient(to right, #eff6ff, #eef2ff)',
        border: '1px solid #bfdbfe',
        borderRadius: '0.75rem',
        padding: '1rem'
      }}>
        <div className="grid grid-cols-4" style={{ borderRadius: '0.75rem' }}>
          <div className="px-4 py-3 text-center" style={{ borderRight: '1px solid #bfdbfe' }}>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div style={{ 
                padding: '0.375rem', 
                backgroundColor: '#dbeafe', 
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users className="h-4 w-4" style={{ color: '#2563eb' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#1e40af' }}>Wszyscy</span>
            </div>
            <p className="text-xl font-bold" style={{ color: '#1e3a8a' }}>{clients.length}</p>
          </div>
          
          <div className="px-4 py-3 text-center" style={{ borderRight: '1px solid #bfdbfe' }}>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div style={{ 
                padding: '0.375rem', 
                backgroundColor: '#dcfce7', 
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users className="h-4 w-4" style={{ color: '#16a34a' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#15803d' }}>Aktywni</span>
            </div>
            <p className="text-xl font-bold" style={{ color: '#14532d' }}>
              {clients.filter(c => c.cases.some((case_: { closedDate?: Date | null }) => !case_.closedDate)).length}
            </p>
          </div>
          
          <div className="px-4 py-3 text-center" style={{ borderRight: '1px solid #bfdbfe' }}>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div style={{ 
                padding: '0.375rem', 
                backgroundColor: '#fef3c7', 
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar className="h-4 w-4" style={{ color: '#d97706' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#92400e' }}>Nowi</span>
            </div>
            <p className="text-xl font-bold" style={{ color: '#78350f' }}>
              {clients.filter(c => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return new Date(c.createdAt) > thirtyDaysAgo;
              }).length}
            </p>
          </div>
          
          <div className="px-4 py-3 text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div style={{ 
                padding: '0.375rem', 
                backgroundColor: '#f3e8ff', 
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin className="h-4 w-4" style={{ color: '#9333ea' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#7c3aed' }}>Miasta</span>
            </div>
            <p className="text-xl font-bold" style={{ color: '#581c87' }}>{uniqueCities.length}</p>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-750 dark:to-gray-700 border-b border-slate-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Lista klientów ({filteredClients.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-750 border-b border-slate-200 dark:border-gray-600">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  Klient
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  Kontakt
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  PESEL
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  Lokalizacja
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  Sprawy
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  Agent
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  Data dodania
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-medium">
                          {client.firstName[0]}{client.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {client.firstName} {client.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-mono">
                      {client.pesel || 'Brak danych'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {client.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                        {client.cases.length} spraw
                      </span>
                      {client.cases.some((case_: { closedDate?: Date | null }) => !case_.closedDate) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm">
                          Aktywne
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {client.assignedAgent ? 
                        `${client.assignedAgent.firstName} ${client.assignedAgent.lastName}` : 
                        'Nieprzypisany'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(client.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowClientDetails(true);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Zobacz szczegóły"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingClient(client);
                          setShowEditModal(true);
                        }}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-all"
                        title="Edytuj"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          // TODO: More actions
                        }}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 rounded transition-all"
                        title="Więcej akcji"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterCity ? 'Brak klientów spełniających kryteria' : 'Brak klientów'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onClientAdded={() => {
          fetchClients();
          setShowAddModal(false);
        }}
      />

      <EditClientModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingClient(null);
          fetchClients(); // Odśwież listę tutaj!
        }}
        client={editingClient}
      />

      {/* Client Details Modal */}
      {showClientDetails && selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with blur */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowClientDetails(false)}></div>
          
          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all">
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-medium text-lg">
                    {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">Szczegóły klienta</p>
                </div>
              </div>
              <button
                onClick={() => setShowClientDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  Dane kontaktowe
                </h4>
                <div className="space-y-3">
                  {selectedClient.email && (
                    <div className="flex items-center text-sm bg-white dark:bg-gray-600 rounded-lg p-3 shadow-sm">
                      <Mail className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-gray-700 dark:text-gray-200">{selectedClient.email}</span>
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div className="flex items-center text-sm bg-white dark:bg-gray-600 rounded-lg p-3 shadow-sm">
                      <Phone className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-gray-700 dark:text-gray-200">{selectedClient.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm bg-white dark:bg-gray-600 rounded-lg p-3 shadow-sm">
                    <MapPin className="h-4 w-4 text-purple-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-200">{selectedClient.city}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-green-100 dark:border-gray-600">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                  Statystyki
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm bg-white dark:bg-gray-600 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-amber-500 mr-3" />
                      <span className="text-gray-700 dark:text-gray-200">Sprawy</span>
                    </div>
                    <span className="font-semibold text-amber-600">{selectedClient.cases.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-white dark:bg-gray-600 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-indigo-500 mr-3" />
                      <span className="text-gray-700 dark:text-gray-200">Notatki</span>
                    </div>
                    <span className="font-semibold text-indigo-600">{selectedClient.notes.length}</span>
                  </div>
                  <div className="flex items-center text-sm bg-white dark:bg-gray-600 rounded-lg p-3 shadow-sm">
                    <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-200">Dodany {formatDate(selectedClient.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedClient.cases.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-purple-100 dark:border-gray-600">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                  Sprawy ({selectedClient.cases.length})
                </h4>
                <div className="space-y-3">
                  {selectedClient.cases.map((case_: { id: string; caseNumber: string; status: { name: string }; createdAt: string; claimValue?: number }) => (
                    <div key={case_.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-600 rounded-lg shadow-sm border border-gray-100 dark:border-gray-500">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-900 dark:text-white">{case_.caseNumber}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {case_.status.name} • {formatDate(case_.createdAt)}
                          </div>
                        </div>
                      </div>
                      {case_.claimValue && (
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {Number(case_.claimValue).toLocaleString('pl-PL')} zł
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-600">
              <button
                onClick={() => setShowClientDetails(false)}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-all"
              >
                Zamknij
              </button>
            </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
