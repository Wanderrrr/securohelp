'use client'

import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, FileText, Shield } from 'lucide-react';
import { ClientWithRelations, UserWithRelations, ApiResponse } from '@/types/database';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithRelations | null;
}

interface UpdateClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pesel: string;
  idNumber: string;
  street: string;
  houseNumber: string;
  apartmentNumber: string;
  postalCode: string;
  city: string;
  notes: string;
  gdprConsent: boolean;
  marketingConsent: boolean;
  assignedAgentId: string;
}

export default function EditClientModal({ isOpen, onClose, client }: EditClientModalProps) {
  const [formData, setFormData] = useState<UpdateClientData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pesel: '',
    idNumber: '',
    street: '',
    houseNumber: '',
    apartmentNumber: '',
    postalCode: '',
    city: '',
    notes: '',
    gdprConsent: false,
    marketingConsent: false,
    assignedAgentId: ''
  });

  const [agents, setAgents] = useState<UserWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Załaduj dane klienta do formularza
  useEffect(() => {
    if (client) {
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || '',
        phone: client.phone || '',
        pesel: client.pesel || '', // Użyj prawdziwych danych
        idNumber: client.idNumber || '', // Użyj prawdziwych danych
        street: client.street || '', // Użyj prawdziwych danych
        houseNumber: client.houseNumber || '',
        apartmentNumber: client.apartmentNumber || '',
        postalCode: client.postalCode || '',
        city: client.city,
        notes: (client as any).clientNotes || '',
        gdprConsent: client.gdprConsent,
        marketingConsent: client.marketingConsent,
        assignedAgentId: client.assignedAgentId || ''
      });
    }
  }, [client]);

  // Załaduj agentów
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/users?role=AGENT');
        if (response.ok) {
          const data: ApiResponse<UserWithRelations[]> = await response.json();
          setAgents(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };

    if (isOpen) {
      fetchAgents();
    }
  }, [isOpen]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔥 FORM SUBMIT TRIGGERED!');
    e.preventDefault();
    if (!client) {
      console.log('❌ No client found, returning');
      return;
    }
    
    console.log('✅ Starting update process...');
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 WYSYŁANIE AKTUALIZACJI:', formData);
      console.log('🎯 Client ID:', client.id);
      console.log('📡 URL:', `/api/clients/${client.id}`);
      
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ważne! Dodaj ciasteczka
        body: JSON.stringify(formData),
      });

      console.log('📊 Response status:', response.status);
      const responseText = await response.text();
      console.log('📄 Response text:', responseText);
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log('✅ Aktualizacja pomyślna:', data);
          onClose();
          resetForm();
        } catch (parseError) {
          console.error('❌ Błąd parsowania JSON:', parseError);
          setError('Błąd parsowania odpowiedzi serwera');
        }
      } else {
        console.error('❌ Błąd HTTP:', response.status, responseText);
        try {
          const data = JSON.parse(responseText);
          setError(data.error || 'Wystąpił błąd podczas aktualizacji klienta');
        } catch {
          setError(`Błąd HTTP ${response.status}: ${responseText}`);
        }
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      setError('Wystąpił błąd sieci podczas aktualizacji klienta');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      pesel: '',
      idNumber: '',
      street: '',
      houseNumber: '',
      apartmentNumber: '',
      postalCode: '',
      city: '',
      notes: '',
      gdprConsent: false,
      marketingConsent: false,
      assignedAgentId: ''
    });
    setError('');
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Edytuj klienta
                  </h3>
                  <p className="text-sm text-gray-500">Zaktualizuj dane klienta {client.firstName} {client.lastName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
                <h4 className="text-md font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Dane podstawowe
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Imię *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nazwisko *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-green-100 dark:border-gray-600">
                <h4 className="text-md font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-green-600" />
                  Dane kontaktowe
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-orange-100 dark:border-gray-600">
                <h4 className="text-md font-semibold text-orange-900 dark:text-orange-100 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  Dane osobowe
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        PESEL
                      </label>
                      <input
                        type="text"
                        name="pesel"
                        value={formData.pesel}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="PESEL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Numer dowodu
                      </label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Numer dowodu osobistego"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-purple-100 dark:border-gray-600">
                <h4 className="text-md font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                  Adres
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ulica
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ulica"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nr domu
                      </label>
                      <input
                        type="text"
                        name="houseNumber"
                        value={formData.houseNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nr mieszkania
                      </label>
                      <input
                        type="text"
                        name="apartmentNumber"
                        value={formData.apartmentNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Kod pocztowy
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        pattern="[0-9]{2}-[0-9]{3}"
                        placeholder="00-000"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Miasto *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-teal-100 dark:border-gray-600">
                <h4 className="text-md font-semibold text-teal-900 dark:text-teal-100 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-teal-600" />
                  Dodatkowe informacje
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Przypisany agent
                    </label>
                    <select
                      name="assignedAgentId"
                      value={formData.assignedAgentId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Wybierz agenta (opcjonalne)</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.firstName} {agent.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notatki
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dodatkowe informacje o kliencie..."
                    />
                  </div>
                </div>
              </div>

              {/* Consents */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-red-100 dark:border-gray-600">
                <h4 className="text-md font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Zgody
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="gdprConsent"
                      checked={formData.gdprConsent}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    />
                    <label className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Zgoda na przetwarzanie danych osobowych (GDPR) *</span>
                      <br />
                      <span className="text-xs text-gray-500">
                        Wyrażam zgodę na przetwarzanie moich danych osobowych w celu obsługi sprawy prawnej.
                      </span>
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    />
                    <label className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Zgoda marketingowa</span>
                      <br />
                      <span className="text-xs text-gray-500">
                        Wyrażam zgodę na otrzymywanie informacji handlowych drogą elektroniczną.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-600">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-all"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? 'Aktualizowanie...' : 'Zaktualizuj klienta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
