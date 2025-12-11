import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2, X, CheckCircle } from './Icons';
import { UploadedFile } from '../types';

interface FileUploadProps {
  label: string;
  files: UploadedFile[];
  onUpload: (file: UploadedFile) => void;
  onDelete: (fileName: string) => void;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, files, onUpload, onDelete, accept = "application/pdf" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateAndProcess = (file: File) => {
    setError(null);
    setSuccessMessage(null);
    
    // Check file size (30MB = 30 * 1024 * 1024 bytes)
    if (file.size > 30 * 1024 * 1024) {
      setError("File is too large. Maximum size is 30MB.");
      return;
    }

    processFile(file);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndProcess(file);
    }
    // Reset input value to allow selecting the same file again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  const processFile = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newFile: UploadedFile = {
        name: file.name,
        dataUrl: dataUrl,
        type: file.type,
        uploadedAt: new Date().toLocaleDateString(),
      };
      onUpload(newFile);
      setLoading(false);
      
      // Trigger Success Toast
      setSuccessMessage(`File "${file.name}" uploaded successfully.`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setSuccessMessage(null);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Invalid file type. Please upload a PDF.");
        return;
      }
      validateAndProcess(file);
    }
  };

  const handleDeleteClick = (fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      onDelete(fileName);
    }
  };

  return (
    <div className="w-full mb-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">{label}</h3>
      
      {/* Success Toast */}
      {successMessage && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-2 text-sm shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Drop Zone */}
      <div 
        onClick={triggerInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : error 
              ? 'border-red-300 bg-red-50' 
              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
          }
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept={accept} 
          className="hidden" 
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`p-3 rounded-full ${error ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
            {error ? <X className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <div className="text-sm text-slate-600">
            {loading ? (
              <span className="text-blue-600 font-medium animate-pulse">Processing...</span>
            ) : error ? (
              <span className="text-red-600 font-medium">{error}</span>
            ) : (
              <>
                <span className="font-semibold text-blue-600 hover:text-blue-700">Click to upload</span> or drag and drop
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">PDF files only (Max 30MB)</p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 grid gap-2">
          {files.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-red-50 rounded-lg">
                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-800 truncate">{file.name}</span>
                  <span className="text-xs text-slate-400">{file.uploadedAt}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteClick(file.name)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;