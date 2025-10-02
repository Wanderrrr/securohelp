'use client'

import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentWithRelations {
  id: string;
  originalFileName: string;
  mimeType: string | null;
  fileSize: number | null;
  description: string | null;
  documentDate: Date | null;
  uploadedAt: Date;
  category: {
    name: string;
  };
  case: {
    caseNumber: string;
    client: {
      firstName: string;
      lastName: string;
    };
  };
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentWithRelations | null;
  documents: DocumentWithRelations[];
  onDownload: (document: DocumentWithRelations) => void;
  onShowDetails: (document: DocumentWithRelations) => void;
  onDocumentChange: (document: DocumentWithRelations) => void;
}

export default function FilePreviewModal({ 
  isOpen, 
  onClose, 
  document,
  documents,
  onDownload,
  onShowDetails,
  onDocumentChange
}: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Find current document index
  const currentIndex = documents.findIndex(doc => doc.id === document?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < documents.length - 1;

  // Navigation functions
  const goToPrevious = () => {
    if (hasPrevious) {
      const previousDoc = documents[currentIndex - 1];
      onDocumentChange(previousDoc);
      resetTransforms();
    }
  };

  const goToNext = () => {
    if (hasNext) {
      const nextDoc = documents[currentIndex + 1];
      onDocumentChange(nextDoc);
      resetTransforms();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          resetTransforms();
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRotate();
          break;
      }
    };

    if (isOpen) {
      window.document.addEventListener('keydown', handleKeyDown);
      return () => window.document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentIndex, documents.length, zoom]);

  if (!isOpen || !document) return null;

  const isImage = document.mimeType?.startsWith('image/');
  const isPDF = document.mimeType === 'application/pdf';
  
  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Nieznany rozmiar';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileUrl = () => {
    // Endpoint do inline viewing (bez wymuszania download)
    return `/api/documents/${document.id}/view`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="relative w-full h-full max-w-7xl max-h-full bg-gray-900 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4 text-white min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold truncate">{document.originalFileName}</h3>
                <p className="text-sm text-gray-300">
                  {document.case.caseNumber} • {formatFileSize(document.fileSize)} • {document.category.name}
                </p>
                <p className="text-xs text-gray-400">
                  {currentIndex + 1} z {documents.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                disabled={!hasPrevious}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Poprzedni (←)"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                disabled={!hasNext}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Następny (→)"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Divider */}
              <div className="h-6 w-px bg-white bg-opacity-30"></div>

              {/* Zoom Controls (tylko dla obrazów) */}
              {isImage && (
                <>
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.25}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Pomniejsz"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </button>
                  <span className="text-white text-sm px-2 min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Powiększ"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    title="Obróć"
                  >
                    <RotateCw className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Action Buttons */}
              <button
                onClick={() => onShowDetails(document)}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Zobacz szczegóły"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDownload(document)}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Pobierz"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  resetTransforms();
                  onClose();
                }}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Zamknij"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts help */}
        <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-75 backdrop-blur-sm rounded-lg p-3 text-white text-xs space-y-1">
          <div className="font-semibold mb-2">Skróty klawiszowe:</div>
          <div>← → : Nawigacja</div>
          {isImage && (
            <>
              <div>+ - : Zoom</div>
              <div>R : Obróć</div>
            </>
          )}
          <div>Esc : Zamknij</div>
        </div>

        {/* Content */}
        <div className="w-full h-full pt-20 pb-4 px-4 flex items-center justify-center overflow-auto">
          {isImage ? (
            <div className="flex items-center justify-center min-h-full">
              <img
                src={getFileUrl()}
                alt={document.originalFileName}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  cursor: zoom > 1 ? 'move' : 'zoom-in'
                }}
                onClick={handleZoomIn}
                onError={(e) => {
                  console.error('Error loading image preview');
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJsxIXkZCBwb2RnbMSFZHU8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
          ) : isPDF ? (
            <div className="w-full h-full bg-white rounded-lg">
              <iframe
                src={`${getFileUrl()}#toolbar=1&navpanes=1&scrollbar=1&zoom=page-fit`}
                className="w-full h-full border-0 rounded-lg"
                title={document.originalFileName}
                onError={() => {
                  console.error('PDF iframe loading error');
                }}
                onLoad={() => {
                  console.log('PDF loaded successfully in iframe');
                }}
              />
            </div>
          ) : (
            // Dla innych typów plików
            <div className="text-center text-white">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Eye className="h-12 w-12 text-white opacity-60" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{document.originalFileName}</h3>
                <p className="text-gray-300 mb-4">
                  Podgląd nie jest dostępny dla tego typu pliku
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  Typ: {document.mimeType || 'Nieznany'} • Rozmiar: {formatFileSize(document.fileSize)}
                </p>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => onDownload(document)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pobierz plik
                </button>
                <button
                  onClick={() => onShowDetails(document)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Zobacz szczegóły
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
