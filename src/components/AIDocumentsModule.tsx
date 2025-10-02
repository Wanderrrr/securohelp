'use client'

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface CaseWithRelations {
  id: string;
  caseNumber: string;
  client: {
    firstName: string;
    lastName: string;
  };
  claimValue: number | null;
  status: {
    name: string;
  };
}

interface AIDocument {
  id: string;
  caseId: string;
  type: 'cost_analysis' | 'appeal' | 'summary' | 'letter';
  title: string;
  content: string;
  status: 'generating' | 'completed' | 'error';
  createdAt: Date;
  case: {
    caseNumber: string;
    client: {
      firstName: string;
      lastName: string;
    };
  };
}

interface AIDocumentsModuleProps {
  preselectedCaseNumber?: string;
  onClearCaseFilter?: () => void;
}

export default function AIDocumentsModule({ 
  preselectedCaseNumber, 
  onClearCaseFilter 
}: AIDocumentsModuleProps) {
  const [cases, setCases] = useState<CaseWithRelations[]>([]);
  const [aiDocuments, setAiDocuments] = useState<AIDocument[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<AIDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Fetch cases for selection
  useEffect(() => {
    fetchCases();
    fetchAIDocuments();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases?limit=100');
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
        
        // Auto-select case if preselected
        if (preselectedCaseNumber) {
          const matchedCase = data.cases.find((c: CaseWithRelations) => 
            c.caseNumber === preselectedCaseNumber
          );
          if (matchedCase) {
            setSelectedCase(matchedCase.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const fetchAIDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-documents');
      if (response.ok) {
        const data = await response.json();
        setAiDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching AI documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCostAnalysis = async () => {
    if (!selectedCase) {
      alert('Wybierz sprawę');
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch('/api/ai-documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caseId: selectedCase,
          type: 'cost_analysis'
        })
      });

      if (response.ok) {
        const newDocument = await response.json();
        setAiDocuments(prev => [newDocument, ...prev]);
        alert('Analiza kosztorysu została rozpoczęta!');
      } else {
        alert('Błąd podczas generowania analizy');
      }
    } catch (error) {
      console.error('Error generating cost analysis:', error);
      alert('Błąd połączenia');
    } finally {
      setGenerating(false);
    }
  };

  const generateAppeal = async () => {
    if (!selectedCase) {
      alert('Wybierz sprawę');
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch('/api/ai-documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caseId: selectedCase,
          type: 'appeal'
        })
      });

      if (response.ok) {
        const newDocument = await response.json();
        setAiDocuments(prev => [newDocument, ...prev]);
        alert('Generowanie odwołania zostało rozpoczęte!');
      } else {
        alert('Błąd podczas generowania odwołania');
      }
    } catch (error) {
      console.error('Error generating appeal:', error);
      alert('Błąd połączenia');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generating':
        return 'Generowanie...';
      case 'completed':
        return 'Gotowe';
      case 'error':
        return 'Błąd';
      default:
        return 'Nieznany';
    }
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'cost_analysis':
        return 'Analiza kosztorysu';
      case 'appeal':
        return 'Odwołanie';
      case 'summary':
        return 'Podsumowanie sprawy';
      case 'letter':
        return 'Pismo do TU';
      default:
        return 'Dokument AI';
    }
  };

  const filteredDocuments = aiDocuments.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.case.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${doc.case.client.firstName} ${doc.case.client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bot className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dokumenty AI</h1>
            <p className="text-gray-600 dark:text-gray-400">Generowanie dokumentów przez sztuczną inteligencję</p>
          </div>
        </div>
        <button
          onClick={fetchAIDocuments}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Odśwież
        </button>
      </div>

      {/* Case Filter */}
      {preselectedCaseNumber && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Filtrowane dla sprawy: <strong>{preselectedCaseNumber}</strong>
            </span>
            <button
              onClick={onClearCaseFilter}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Usuń filtr
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Case Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Wybierz sprawę
          </h3>
          <select
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Wybierz sprawę --</option>
            {cases.map(case_ => (
              <option key={case_.id} value={case_.id}>
                {case_.caseNumber} - {case_.client.firstName} {case_.client.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Cost Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Analiza kosztorysu
          </h3>
          <button
            onClick={generateCostAnalysis}
            disabled={!selectedCase || generating}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analizuję...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Analizuj kosztorys
              </>
            )}
          </button>
        </div>

        {/* Generate Appeal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Generuj odwołanie
          </h3>
          <button
            onClick={generateAppeal}
            disabled={!selectedCase || generating}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generuję...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Napisz odwołanie
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Szukaj dokumentów AI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Wygenerowane dokumenty ({filteredDocuments.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Ładowanie dokumentów...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Brak dokumentów spełniających kryteria' : 'Brak wygenerowanych dokumentów AI'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Wybierz sprawę i wygeneruj pierwszy dokument
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(doc.status)}
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {doc.title}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {getDocumentTypeText(doc.type)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          doc.status === 'generating' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {getStatusText(doc.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Sprawa: {doc.case.caseNumber} - {doc.case.client.firstName} {doc.case.client.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(doc.createdAt).toLocaleString('pl-PL')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowDocumentModal(true);
                        }}
                        disabled={doc.status !== 'completed'}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Zobacz
                      </button>
                      {doc.status === 'completed' && (
                        <button
                          onClick={() => {
                            // TODO: Implement download
                            alert('Pobieranie dokumentu - do zaimplementowania');
                          }}
                          className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Pobierz
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedDocument.title}
              </h3>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                  {selectedDocument.content}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Zamknij
              </button>
              <button
                onClick={() => {
                  // TODO: Implement download
                  alert('Pobieranie dokumentu - do zaimplementowania');
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Pobierz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
