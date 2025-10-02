'use client'

import React, { useState } from 'react';
import { X, Plus, Building2 } from 'lucide-react';

interface AddInsuranceCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyAdded: (company: any) => void;
}

export default function AddInsuranceCompanyModal({ 
  isOpen, 
  onClose, 
  onCompanyAdded 
}: AddInsuranceCompanyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Nazwa towarzystwa jest wymagana');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/insurance-companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newCompany = await response.json();
        onCompanyAdded(newCompany);
        setFormData({
          name: '',
          shortName: '',
          phone: '',
          email: ''
        });
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Błąd podczas dodawania towarzystwa');
      }
    } catch (error) {
      console.error('Error adding insurance company:', error);
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dodaj towarzystwo ubezpieczeniowe
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pełna nazwa towarzystwa *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="np. Powszechny Zakład Ubezpieczeń S.A."
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skrót / Nazwa handlowa
              </label>
              <input
                type="text"
                name="shortName"
                value={formData.shortName}
                onChange={handleInputChange}
                placeholder="np. PZU"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="np. +48 22 123 45 67"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="kontakt@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Dodawanie...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj towarzystwo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
