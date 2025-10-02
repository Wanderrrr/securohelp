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
  Plus
} from 'lucide-react';
import AddInsuranceCompanyModal from './AddInsuranceCompanyModal';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
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

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCaseModal({ isOpen, onClose, onSuccess }: AddCaseModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    incidentDate: '',
    incidentDescription: '',
    incidentLocation: '',
    policyNumber: '',
    claimNumber: '',
    claimValue: '',
    insuranceCompanyId: '',
    assignedAgentId: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleRegistration: '',
    vehicleYear: '',
    internalNotes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchInsuranceCompanies();
      fetchAgents();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients?limit=100', {
        cache: 'no-store'
      });
      if (response.ok) {
        const result = await response.json();
        setClients(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchInsuranceCompanies = async () => {
    try {
      console.log('🏢 Fetching insurance companies...');
      const response = await fetch('/api/insurance-companies');
      console.log('📡 Insurance companies API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Insurance companies loaded:', data.length, 'companies');
        setInsuranceCompanies(data);
      } else {
        console.error('❌ Failed to fetch insurance companies:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('💥 Failed to fetch insurance companies:', error);
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

  const handleCompanyAdded = (newCompany: InsuranceCompany) => {
    setInsuranceCompanies(prev => [...prev, newCompany]);
    setFormData(prev => ({
      ...prev,
      insuranceCompanyId: newCompany.id.toString()
    }));
    console.log(`✅ Added new insurance company: ${newCompany.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        claimValue: formData.claimValue ? parseFloat(formData.claimValue) : null,
        vehicleYear: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
        insuranceCompanyId: formData.insuranceCompanyId ? parseInt(formData.insuranceCompanyId) : null
      };

      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          clientId: '',
          incidentDate: '',
          incidentDescription: '',
          incidentLocation: '',
          policyNumber: '',
          claimNumber: '',
          claimValue: '',
          insuranceCompanyId: '',
          assignedAgentId: '',
          vehicleBrand: '',
          vehicleModel: '',
          vehicleRegistration: '',
          vehicleYear: '',
          internalNotes: ''
        });
      } else {
        const errorData = await response.json();
        alert(`Błąd: ${errorData.error || 'Nie udało się dodać sprawy'}`);
      }
    } catch (error) {
      console.error('Error creating case:', error);
      alert('Wystąpił błąd podczas dodawania sprawy');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dodaj nową sprawę
            </h3>
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
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Informacje podstawowe
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Klient *
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Wybierz klienta</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} {client.email && `(${client.email})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data zdarzenia *
                </label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Towarzystwo ubezpieczeniowe
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCompanyModal(true)}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Dodaj nowe
                  </button>
                </div>
                <select
                  name="insuranceCompanyId"
                  value={formData.insuranceCompanyId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Wybierz towarzystwo</option>
                  {insuranceCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.shortName || company.name}
                    </option>
                  ))}
                </select>
              </div>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-purple-100 dark:border-gray-600">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2 text-purple-600" />
              Dane pojazdu (opcjonalne)
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
              {loading ? 'Dodawanie...' : 'Dodaj sprawę'}
            </button>
          </div>
        </form>
      </div>

      {/* Add Insurance Company Modal */}
      <AddInsuranceCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onCompanyAdded={handleCompanyAdded}
      />
    </div>
  );
}
