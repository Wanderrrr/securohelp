'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, FileText, Calendar, User, Briefcase } from 'lucide-react';
import { CaseWithRelations } from '@/src/types/database';

interface DocumentCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  required: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedCaseId?: string;
}

export default function AddDocumentModal({ isOpen, onClose, onSuccess, preselectedCaseId }: AddDocumentModalProps) {
  const [formData, setFormData] = useState({
    caseId: preselectedCaseId || '',
    categoryId: '',
    description: '',
    documentDate: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [cases, setCases] = useState<CaseWithRelations[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      caseId: preselectedCaseId || '',
      categoryId: '',
      description: '',
      documentDate: ''
    });
    setSelectedFiles([]);
    setError(null);
  }, [preselectedCaseId]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchCases();
      fetchCategories();
    }
  }, [isOpen, resetForm]);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases?limit=100', {
        cache: 'no-store'
      });
      if (response.ok) {
        const result = await response.json();
        setCases(result.cases || []);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/document-categories', {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        // Sprawdź czy plik już nie został dodany
        const isDuplicate = selectedFiles.some(existing => 
          existing.name === file.name && existing.size === file.size
        );
        if (!isDuplicate) {
          validFiles.push(file);
        }
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Nieprawidłowy typ pliku. Dozwolone: PDF, JPG, PNG, GIF, DOC, DOCX';
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'Plik za duży. Maksymalny rozmiar: 10MB';
    }

    return null;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Submit clicked!');
    console.log('📁 Selected files:', selectedFiles.length);
    console.log('📋 Form data:', formData);
    
    setLoading(true);
    setError(null);

    if (selectedFiles.length === 0 || !formData.caseId || !formData.categoryId) {
      console.log('❌ Validation failed:', {
        filesCount: selectedFiles.length,
        caseId: formData.caseId,
        categoryId: formData.categoryId
      });
      setError('Pliki, sprawa i kategoria są wymagane.');
      setLoading(false);
      return;
    }

    console.log('✅ Validation passed, starting upload...');

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Upload każdego pliku osobno
      for (const file of selectedFiles) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('caseId', formData.caseId);
          uploadFormData.append('categoryId', formData.categoryId);
          if (formData.description) uploadFormData.append('description', formData.description);
          if (formData.documentDate) uploadFormData.append('documentDate', formData.documentDate);

          const response = await fetch('/api/documents', {
            method: 'POST',
            body: uploadFormData
          });

          if (response.ok) {
            successCount++;
            console.log(`✅ Uploaded: ${file.name}`);
          } else {
            errorCount++;
            const result = await response.json();
            errors.push(`${file.name}: ${result.error || 'Błąd podczas uploadu'}`);
          }
        } catch (err) {
          errorCount++;
          errors.push(`${file.name}: Błąd sieci`);
          console.error(`Upload error for ${file.name}:`, err);
        }
      }

      // Pokaż wyniki
      if (successCount > 0 && errorCount === 0) {
        // Wszystkie udane
        onSuccess();
        onClose();
      } else if (successCount > 0 && errorCount > 0) {
        // Częściowy sukces
        setError(`Przesłano ${successCount} z ${selectedFiles.length} plików.\n\nBłędy:\n${errors.join('\n')}`);
        onSuccess(); // Odśwież listę żeby pokazać przesłane pliki
      } else {
        // Wszystkie błędy
        setError(`Nie udało się przesłać żadnego pliku:\n${errors.join('\n')}`);
      }
    } catch (err) {
      setError('Wystąpił nieoczekiwany błąd.');
      console.error('Bulk upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col border border-green-200 dark:border-green-700">
        <div className="flex items-center justify-between p-6 border-b border-green-100 dark:border-green-700 bg-gradient-to-r from-green-50 dark:from-gray-700 to-green-100 dark:to-gray-800">
          <h3 className="text-2xl font-bold text-green-800 dark:text-white flex items-center">
            <Upload className="h-6 w-6 mr-3 text-green-600" />
            Dodaj dokument
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="p-6 space-y-6 flex-1">
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Błąd!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFiles.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Wybrane pliki ({selectedFiles.length})
                    </div>
                    <label htmlFor="file" className="cursor-pointer text-green-600 hover:text-green-700 text-sm">
                      + Dodaj więcej
                    </label>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 text-sm ml-2 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <label htmlFor="file" className="cursor-pointer text-green-600 hover:text-green-700">
                      Kliknij aby wybrać pliki
                    </label>
                    {' lub przeciągnij i upuść'}
                  </div>
                  <div className="text-xs text-gray-500">
                    PDF, JPG, PNG, GIF, DOC, DOCX (maks. 10MB każdy)
                  </div>
                  <div className="text-xs text-green-600">
                    💡 Możesz wybrać wiele plików jednocześnie
                  </div>
                </div>
              )}
              <input
                id="file"
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sprawa *
                </label>
                <select
                  name="caseId"
                  value={formData.caseId}
                  onChange={handleInputChange}
                  required
                  disabled={!!preselectedCaseId}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  <option value="">Wybierz sprawę</option>
                  {cases.map((case_) => (
                    <option key={case_.id} value={case_.id}>
                      {case_.caseNumber} - {case_.client.firstName} {case_.client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategoria *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Wybierz kategorię</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} {category.required && '*'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data dokumentu
              </label>
              <input
                type="date"
                name="documentDate"
                value={formData.documentDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Opis
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Opcjonalny opis dokumentu..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>
          </div>

          <div className="p-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              disabled={loading || selectedFiles.length === 0}
            >
              {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
              <span>
                {loading 
                  ? 'Przesyłanie...' 
                  : selectedFiles.length > 1 
                    ? `Dodaj dokumenty (${selectedFiles.length})` 
                    : 'Dodaj dokument'
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
