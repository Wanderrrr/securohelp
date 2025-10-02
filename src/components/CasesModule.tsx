'use client'

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpCircle
} from 'lucide-react';
import { CaseWithRelations } from '@/src/types/database';
import AddCaseModal from './AddCaseModal';
import EditCaseModal from './EditCaseModal';

interface CasesModuleProps {
  onSelectCase?: (case_: CaseWithRelations) => void;
  onNavigateToDocuments?: (caseNumber: string) => void;
}

interface CaseStatus {
  id: number;
  code: string;
  name: string;
  description?: string;
  color?: string;
  sortOrder: number;
  isFinal: boolean;
  isActive: boolean;
}

interface InsuranceCompany {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  isActive: boolean;
}

export default function CasesModule({ onSelectCase, onNavigateToDocuments }: CasesModuleProps) {
  const [cases, setCases] = useState<CaseWithRelations[]>([]);
  const [statuses, setStatuses] = useState<CaseStatus[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseWithRelations | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseWithRelations | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCases();
    fetchStatuses();
    fetchInsuranceCompanies();
  }, [searchTerm, selectedStatus, selectedAgent]);

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedAgent) params.append('agent', selectedAgent);
      params.append('timestamp', Date.now().toString());

      const response = await fetch(`/api/cases?${params}`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      } else {
        console.error('Failed to fetch cases');
      }
    } catch (error) {
      console.error('Cases fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/case-statuses', {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setStatuses(data);
      }
    } catch (error) {
      console.error('Statuses fetch error:', error);
    }
  };

  const fetchInsuranceCompanies = async () => {
    try {
      const response = await fetch('/api/insurance-companies', {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setInsuranceCompanies(data);
      }
    } catch (error) {
      console.error('Insurance companies fetch error:', error);
    }
  };

  const getStatusColor = (statusCode: string) => {
    const status = statuses.find(s => s.code === statusCode);
    if (status?.color) return status.color;
    
    // Fallback colors
    const colors: Record<string, string> = {
      'NEW': '#3B82F6',
      'DOCUMENTS': '#F59E0B',
      'SENT_TO_INSURER': '#8B5CF6',
      'POSITIVE_DECISION': '#10B981',
      'NEGATIVE_DECISION': '#EF4444',
      'APPEAL': '#F97316',
      'LAWSUIT': '#DC2626',
      'CLOSED': '#6B7280'
    };
    return colors[statusCode] || '#6B7280';
  };

  const getStatusIcon = (statusCode: string) => {
    const icons: Record<string, React.ReactNode> = {
      'NEW': <AlertCircle className="h-4 w-4" />,
      'DOCUMENTS': <FileText className="h-4 w-4" />,
      'SENT_TO_INSURER': <ArrowUpCircle className="h-4 w-4" />,
      'POSITIVE_DECISION': <CheckCircle className="h-4 w-4" />,
      'NEGATIVE_DECISION': <XCircle className="h-4 w-4" />,
      'APPEAL': <Clock className="h-4 w-4" />,
      'LAWSUIT': <Building2 className="h-4 w-4" />,
      'CLOSED': <CheckCircle className="h-4 w-4" />
    };
    return icons[statusCode] || <AlertCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const formatCurrency = (amount: number | string | null) => {
    if (!amount) return '-';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(num);
  };

  // Statistics calculation
  const stats = {
    total: cases.length,
    new: cases.filter(c => c.status.code === 'NEW').length,
    inProgress: cases.filter(c => !['NEW', 'CLOSED', 'POSITIVE_DECISION', 'NEGATIVE_DECISION'].includes(c.status.code)).length,
    closed: cases.filter(c => c.status.isFinal).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sprawy</h2>
          <p className="text-gray-500">Zarządzaj sprawami klientów</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Dodaj sprawę</span>
        </button>
      </div>

      {/* Statistics Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wszystkie</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg mx-auto mb-2">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Nowe</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-2">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">W toku</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.closed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Zamknięte</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj spraw..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszystkie statusy</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(searchTerm || selectedStatus || selectedAgent) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('');
                setSelectedAgent('');
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {cases.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Brak spraw</h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus || selectedAgent
                ? 'Nie znaleziono spraw spełniających kryteria wyszukiwania.'
                : 'Dodaj pierwszą sprawę, aby rozpocząć.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-750">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Numer sprawy
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Numer szkody
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Klient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Towarzystwo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Wartość roszczenia
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data zdarzenia
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Agent
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Akcje</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {cases.map((case_) => (
                  <tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onNavigateToDocuments?.(case_.caseNumber)}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors underline decoration-dotted cursor-pointer"
                        title="Kliknij aby zobaczyć dokumenty tej sprawy"
                      >
                        {case_.caseNumber}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {case_.claimNumber || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {case_.client.firstName[0]}{case_.client.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {case_.client.firstName} {case_.client.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {case_.client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getStatusColor(case_.status.code) }}
                      >
                        {getStatusIcon(case_.status.code)}
                        <span>{case_.status.name}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {case_.insuranceCompany?.shortName || case_.insuranceCompany?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(case_.claimValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(case_.incidentDate.toString())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {case_.assignedAgent ? `${case_.assignedAgent.firstName} ${case_.assignedAgent.lastName}` : 'Nieprzypisany'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCase(case_);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Zobacz szczegóły"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCase(case_);
                            setShowEditModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Edytuj"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Details Modal */}
      {showDetailsModal && selectedCase && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Szczegóły sprawy {selectedCase.caseNumber}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Informacje podstawowe</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Numer sprawy</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedCase.caseNumber}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Numer szkody</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedCase.claimNumber || 'Nie nadano'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Klient</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCase.client.firstName} {selectedCase.client.lastName}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Status</label>
                      <div className="text-sm">
                        <span
                          className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getStatusColor(selectedCase.status.code) }}
                        >
                          {getStatusIcon(selectedCase.status.code)}
                          <span>{selectedCase.status.name}</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Data zdarzenia</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedCase.incidentDate.toString())}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Szczegóły finansowe</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Wartość roszczenia</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(selectedCase.claimValue)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Otrzymane odszkodowanie</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(selectedCase.compensationReceived)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Towarzystwo ubezpieczeniowe</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCase.insuranceCompany?.name || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Numer polisy</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCase.policyNumber || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Incident Details */}
              {selectedCase.incidentDescription && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Opis zdarzenia</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedCase.incidentDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Vehicle Details */}
              {(selectedCase.vehicleBrand || selectedCase.vehicleModel || selectedCase.vehicleRegistration) && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Dane pojazdu</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Marka</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCase.vehicleBrand || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Model</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCase.vehicleModel || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Nr rejestracyjny</label>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCase.vehicleRegistration || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Case Modal */}
      <AddCaseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchCases}
      />

      {/* Edit Case Modal */}
      <EditCaseModal
        isOpen={showEditModal}
        case_={editingCase}
        onClose={() => {
          setShowEditModal(false);
          setEditingCase(null);
        }}
        onSuccess={fetchCases}
      />
    </div>
  );
}
