'use client'

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Building2,
  Car,
  FileText,
  DollarSign,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { CaseWithRelations } from '@/src/types/database';

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
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EditCaseModalProps {
  isOpen: boolean;
  case_: CaseWithRelations | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCaseModal({ isOpen, case_, onClose, onSuccess }: EditCaseModalProps) {
  const [statuses, setStatuses] = useState<CaseStatus[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    statusId: '',
    assignedAgentId: '',
    incidentDescription: '',
    incidentLocation: '',
    policyNumber: '',
    claimNumber: '',
    claimValue: '',
    compensationReceived: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleRegistration: '',
    vehicleYear: '',
    internalNotes: '',
    statusComment: ''
  });

  useEffect(() => {
    if (isOpen && case_) {
      fetchStatuses();
      fetchInsuranceCompanies();
      fetchAgents();
      
      // Populate form with case data
      setFormData({
        statusId: case_.statusId?.toString() || '',
        assignedAgentId: case_.assignedAgentId || '',
        incidentDescription: case_.incidentDescription || '',
        incidentLocation: case_.incidentLocation || '',
        policyNumber: case_.policyNumber || '',
        claimNumber: case_.claimNumber || '',
        claimValue: case_.claimValue?.toString() || '',
        compensationReceived: case_.compensationReceived?.toString() || '',
        vehicleBrand: case_.vehicleBrand || '',
        vehicleModel: case_.vehicleModel || '',
        vehicleRegistration: case_.vehicleRegistration || '',
        vehicleYear: case_.vehicleYear?.toString() || '',
        internalNotes: case_.internalNotes || '',
        statusComment: ''
      });
    }
  }, [isOpen, case_]);

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
      console.error('Failed to fetch statuses:', error);
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
      console.error('Failed to fetch insurance companies:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/users?role=AGENT,ADMIN');
      if (response.ok) {
        const result = await response.json();
        setAgents(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!case_) return;

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        claimValue: formData.claimValue ? parseFloat(formData.claimValue) : null,
        compensationReceived: formData.compensationReceived ? parseFloat(formData.compensationReceived) : null,
        vehicleYear: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
        statusId: formData.statusId ? parseInt(formData.statusId) : null
      };

      const response = await fetch(`/api/cases/${case_.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Błąd: ${errorData.error || 'Nie udało się zaktualizować sprawy'}`);
      }
    } catch (error) {
      console.error('Error updating case:', error);
      alert('Wystąpił błąd podczas aktualizacji sprawy');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  if (!isOpen || !case_) return null;

  const currentStatus = statuses.find(s => s.id === case_.statusId);
  const statusChanged = formData.statusId !== case_.statusId?.toString();

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edytuj sprawę {case_.caseNumber}
              </h3>
              <p className="text-sm text-gray-500">
                Klient: {case_.client.firstName} {case_.client.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Status Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Status sprawy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aktualny status
                </label>
                <div className="flex items-center space-x-2">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: getStatusColor(currentStatus?.code || '') }}
                  >
                    {currentStatus?.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    od {formatDate(case_.createdAt.toString())}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nowy status
                </label>
                <select
                  name="statusId"
                  value={formData.statusId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {statusChanged && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Komentarz do zmiany statusu
                </label>
                <textarea
                  name="statusComment"
                  value={formData.statusComment}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Opisz powód zmiany statusu..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Assignment */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-purple-100 dark:border-gray-600">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Przypisanie
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Przypisany agent
              </label>
              <select
                name="assignedAgentId"
                value={formData.assignedAgentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nie przypisuj agenta (do późniejszego przypisania)</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.firstName} {agent.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Incident Details */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-amber-100 dark:border-gray-600">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-amber-600" />
              Szczegóły zdarzenia
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Miejsce zdarzenia
                </label>
                <input
                  type="text"
                  name="incidentLocation"
                  value={formData.incidentLocation}
                  onChange={handleInputChange}
                  placeholder="np. ul. Marszałkowska 1, Warszawa"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opis zdarzenia
                </label>
                <textarea
                  name="incidentDescription"
                  value={formData.incidentDescription}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Opisz przebieg zdarzenia..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-green-100 dark:border-gray-600">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Informacje finansowe
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numer polisy
                </label>
                <input
                  type="text"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleInputChange}
                  placeholder="np. POL/2024/123456"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numer szkody
                </label>
                <input
                  type="text"
                  name="claimNumber"
                  value={formData.claimNumber}
                  onChange={handleInputChange}
                  placeholder="np. SZK/2024/789"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wartość roszczenia (zł)
                </label>
                <input
                  type="number"
                  name="claimValue"
                  value={formData.claimValue}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Otrzymane odszkodowanie (zł)
                </label>
                <input
                  type="number"
                  name="compensationReceived"
                  value={formData.compensationReceived}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-indigo-100 dark:border-gray-600">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2 text-indigo-600" />
              Dane pojazdu
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marka
                </label>
                <input
                  type="text"
                  name="vehicleBrand"
                  value={formData.vehicleBrand}
                  onChange={handleInputChange}
                  placeholder="np. Toyota"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  placeholder="np. Corolla"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nr rejestracyjny
                </label>
                <input
                  type="text"
                  name="vehicleRegistration"
                  value={formData.vehicleRegistration}
                  onChange={handleInputChange}
                  placeholder="np. WA 12345"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rok produkcji
                </label>
                <input
                  type="number"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleInputChange}
                  placeholder="2020"
                  min="1900"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notatki wewnętrzne
            </label>
            <textarea
              name="internalNotes"
              value={formData.internalNotes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Dodatkowe informacje dla zespołu..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
