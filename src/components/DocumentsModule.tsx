'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload, Search, Filter, Eye, Download, Trash2, FileText, File, Image, 
  PlusCircle, AlertCircle, Calendar, User, Briefcase, FolderOpen,
  CheckCircle, XCircle, Clock, Star, ExternalLink, X, Grid, List
} from 'lucide-react';
import AddDocumentModal from './AddDocumentModal';
import FilePreviewModal from './FilePreviewModal';

interface DocumentCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  required: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface DocumentWithRelations {
  id: string;
  caseId: string;
  clientId: string;
  categoryId: number;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  fileHash?: string;
  description?: string;
  documentDate?: string;
  ocrProcessed: boolean;
  ocrText?: string;
  ocrProcessedAt?: string;
  uploadedAt: string;
  uploadedBy: string;
  deletedAt?: string;
  deletedBy?: string;
  case: {
    id: string;
    caseNumber: string;
    client: {
      firstName: string;
      lastName: string;
    };
  };
  category: DocumentCategory;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

interface DocumentsModuleProps {
  selectedCaseId?: string;
  preselectedCaseNumber?: string;
  onClearCaseFilter?: () => void;
}

export default function DocumentsModule({ selectedCaseId, preselectedCaseNumber, onClearCaseFilter }: DocumentsModuleProps) {
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCase, setSelectedCase] = useState(selectedCaseId || preselectedCaseNumber || '');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithRelations | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Initialize filter when preselected case number is provided
  React.useEffect(() => {
    if (preselectedCaseNumber) {
      setSelectedCase(preselectedCaseNumber);
    }
  }, [preselectedCaseNumber]);

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [searchTerm, selectedCategory, selectedCase]);

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedCase) params.append('case', selectedCase);
      params.append('timestamp', Date.now().toString());

      const response = await fetch(`/api/documents?${params}`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Documents fetch error:', error);
    } finally {
      setLoading(false);
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
      console.error('Categories fetch error:', error);
    }
  };

  const getFileIcon = (mimeType: string | undefined, isLarge = false) => {
    const size = isLarge ? "h-8 w-8" : "h-5 w-5";
    
    if (!mimeType) return <File className={`${size} text-gray-500`} />;
    
    if (mimeType.startsWith('image/')) {
      return <Image className={`${size} text-green-500`} />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className={`${size} text-red-500`} />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className={`${size} text-blue-600`} />;
    } else {
      return <File className={`${size} text-gray-500`} />;
    }
  };

  // Component for document thumbnail/icon
  const DocumentThumbnail = ({ document }: { document: DocumentWithRelations }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (document.mimeType?.startsWith('image/')) {
        setLoading(true);
        // Fetch real thumbnail for images
        fetch(`/api/documents/${document.id}/thumbnail`)
          .then(res => res.json())
          .then(data => {
            if (data.thumbnailUrl) {
              setThumbnailUrl(data.thumbnailUrl);
            } else {
              setImageError(true);
            }
          })
          .catch(error => {
            console.error(`Thumbnail error for ${document.originalFileName}:`, error);
            setImageError(true);
          })
          .finally(() => setLoading(false));
      }
    }, [document.id, document.mimeType]);

    // For images: show real thumbnail or loading state
    if (document.mimeType?.startsWith('image/')) {
      
      if (loading) {
        return (
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        );
      }
      
      if (thumbnailUrl && !imageError) {
        return (
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm">
            <img
              src={thumbnailUrl}
              alt={document.originalFileName}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>
        );
      }
    }

    // Fallback to icon for non-images or failed images

    // Fallback to icon for non-images or failed images
    return (
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        {getFileIcon(document.mimeType, true)}
      </div>
    );
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (doc: DocumentWithRelations) => {
    try {
      console.log(`🔽 Starting download for: ${doc.originalFileName}`);
      const response = await fetch(`/api/documents/${doc.id}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log(`✅ Download completed: ${doc.originalFileName}`);
      } else {
        const errorData = await response.json();
        console.error('Download failed:', errorData);
        alert(`Download failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed due to network error');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten dokument?')) return;
    
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Statistics calculation
  const stats = {
    total: documents.length,
    byCategory: categories.map(cat => ({
      name: cat.name,
      count: documents.filter(doc => doc.categoryId === cat.id).length
    })).filter(stat => stat.count > 0),
    recentUploads: documents.filter(doc => {
      const uploadDate = new Date(doc.uploadedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate > weekAgo;
    }).length
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
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dokumenty</h2>
            {preselectedCaseNumber && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  📋 Sprawa: {preselectedCaseNumber}
                </span>
                <button
                  onClick={() => {
                    setSelectedCase('');
                    onClearCaseFilter?.();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Usuń filtr sprawy"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-500">
            {preselectedCaseNumber 
              ? `Dokumenty dla sprawy ${preselectedCaseNumber}` 
              : 'Zarządzaj dokumentami spraw'
            }
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors shadow-lg"
        >
          <Upload className="h-5 w-5" />
          <span>Dodaj dokument</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Wszystkie</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <FolderOpen className="h-8 w-8 text-blue-500" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ostatni tydzień</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentUploads}</p>
          </div>
          <Upload className="h-8 w-8 text-green-500" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Kategorie</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.byCategory.length}</p>
          </div>
          <Star className="h-8 w-8 text-amber-500" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Wymagane</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.filter(c => c.required).length}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj po nazwie pliku, opisie, sprawie..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Wszystkie kategorie</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Numer sprawy..."
          className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCase}
          onChange={(e) => setSelectedCase(e.target.value)}
        />
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title="Widok listy"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title="Widok siatki"
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Documents Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold">Brak dokumentów</p>
            <p>Dodaj pierwszy dokument, aby rozpocząć.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-750">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dokument
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kategoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sprawa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rozmiar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dodano
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(document.mimeType)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {document.originalFileName}
                          </div>
                          {document.description && (
                            <div className="text-sm text-gray-500">
                              {document.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {document.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {document.case.caseNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {document.case.client.firstName} {document.case.client.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatFileSize(document.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(document.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDocument(document);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Zobacz szczegóły"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(document)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Pobierz"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Usuń"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {documents.map((document) => (
              <div key={document.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group">
                <div 
                  onClick={() => {
                    setSelectedDocument(document);
                    setShowPreviewModal(true);
                  }}
                  className="space-y-3"
                >
                  {/* File Icon/Thumbnail */}
                  <div className="flex justify-center">
                    <DocumentThumbnail document={document} />
                  </div>
                  
                  {/* File Name */}
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={document.originalFileName}>
                      {document.originalFileName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(document.fileSize)}
                    </p>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {document.category.name}
                    </span>
                  </div>
                  
                  {/* Case Info */}
                  <div className="text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {document.case.caseNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {document.case.client.firstName} {document.case.client.lastName}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons - Show on Hover */}
                <div className="mt-3 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDocument(document);
                      setShowDetailsModal(true);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Zobacz szczegóły"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(document);
                    }}
                    className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Pobierz"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(document.id);
                    }}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Usuń"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Details Modal */}
      {selectedDocument && showDetailsModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  {getFileIcon(selectedDocument.mimeType)}
                  <span className="ml-2">Szczegóły dokumentu</span>
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-500">Nazwa pliku</label>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedDocument.originalFileName}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Kategoria</label>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedDocument.category.name}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Sprawa</label>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {selectedDocument.case.caseNumber} - {selectedDocument.case.client.firstName} {selectedDocument.case.client.lastName}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Rozmiar</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{formatFileSize(selectedDocument.fileSize)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Typ</label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedDocument.mimeType}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Dodano przez</label>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedDocument.uploadedBy.firstName} {selectedDocument.uploadedBy.lastName}
                </div>
                <div className="text-sm text-gray-500">{formatDate(selectedDocument.uploadedAt)}</div>
              </div>
              
              {selectedDocument.description && (
                <div>
                  <label className="text-sm text-gray-500">Opis</label>
                  <div className="text-sm text-gray-900 dark:text-white">{selectedDocument.description}</div>
                </div>
              )}
              
              {selectedDocument.documentDate && (
                <div>
                  <label className="text-sm text-gray-500">Data dokumentu</label>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedDocument.documentDate).toLocaleDateString('pl-PL')}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Pobierz</span>
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchDocuments}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        document={selectedDocument}
        documents={documents}
        onDownload={handleDownload}
        onShowDetails={(document) => {
          setShowPreviewModal(false);
          setSelectedDocument(document);
          setShowDetailsModal(true);
        }}
        onDocumentChange={(document) => {
          setSelectedDocument(document);
        }}
      />
    </div>
  );
}
