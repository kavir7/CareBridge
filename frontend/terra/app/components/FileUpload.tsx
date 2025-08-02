'use client';

import { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = '.png,.jpg,.jpeg,.pdf',
  maxSize = 10, // 10MB default
  label = 'Upload File',
  className = ''
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      setSelectedFile(null);
      return;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = accept.replace(/\./g, '').split(',');
    
    if (!allowedExtensions.includes(fileExtension || '')) {
      setError(`File type not allowed. Please upload: ${accept}`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    
    if (file) {
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) {
        input.files = e.dataTransfer.files;
        handleFileChange({ target: { files: e.dataTransfer.files } } as any);
      }
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) return;
    await handleFileUpload(selectedFile);
  };

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setAnalysisResult(data); // Save result to state
      console.log('Prescription data:', data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <div className="space-y-2">
            <div className="text-gray-400">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              {' '}or drag and drop
            </div>
            <p className="text-xs text-gray-500">
              {accept.toUpperCase()} up to {maxSize}MB
            </p>
          </div>
        </label>
      </div>

      {selectedFile && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-2">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                File selected: {selectedFile.name}
              </p>
              <p className="text-sm text-green-700">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAnalyzeClick}
          >
            Analyze Prescription
          </button>
        </div>
      )}

      {analysisResult && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded">
          <h4 className="font-semibold mb-2">Prescription Summary</h4>
          <div className="space-y-2 text-gray-800">
            {analysisResult.patient_name && (
              <div>
                <span className="font-medium">Patient Name:</span> {analysisResult.patient_name}
              </div>
            )}
            {analysisResult.medication && (
              <div>
                <span className="font-medium">Medication:</span> {analysisResult.medication}
              </div>
            )}
            {analysisResult.instructions && (
              <div>
                <span className="font-medium">Instructions:</span> {analysisResult.instructions}
              </div>
            )}
            {analysisResult.doctor && (
              <div>
                <span className="font-medium">Prescribed By:</span> {analysisResult.doctor}
              </div>
            )}
            {analysisResult.expiry && (
              <div>
                <span className="font-medium">Expiry Date:</span> {analysisResult.expiry}
              </div>
            )}
            {/* Optionally show full text for troubleshooting */}
            {/* <details>
              <summary className="text-sm text-gray-500 cursor-pointer">Show full prescription text</summary>
              <div className="text-xs text-gray-500 mt-2">{analysisResult.full_text}</div>
            </details> */}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}