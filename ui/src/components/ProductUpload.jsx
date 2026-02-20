import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadFile, getJobStatus } from '../services/api';

/**
 * Product Upload Component
 * Allows users to upload product files (CSV, JSON, Excel) for ingestion
 */
export const ProductUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const statusCheckInterval = useRef(null);

  // Allowed file types
  const allowedTypes = ['.csv', '.json', '.xlsx', '.xls'];
  const allowedMimeTypes = [
    'text/csv',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds 50MB limit');
      return;
    }

    setFile(selectedFile);
    setJobId(null);
    setJobStatus(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload file
      const response = await uploadFile(formData);
      
      if (response.job_id) {
        setJobId(response.job_id);
        setUploadProgress(10);
        
        // Start polling for status
        startStatusPolling(response.job_id);
        
        toast.success('File uploaded successfully! Processing...');
      } else {
        throw new Error('No job ID returned');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const startStatusPolling = (jobId) => {
    // Clear any existing interval
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }

    // Poll every 2 seconds
    statusCheckInterval.current = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        setJobStatus(status);
        setUploadProgress(status.progress * 100);

        // Stop polling if job is complete or failed
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(statusCheckInterval.current);
          setIsUploading(false);
          
          if (status.status === 'completed') {
            toast.success(`Upload completed! ${status.successful_items} products created.`);
          } else {
            toast.error(`Upload failed: ${status.error_message || 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
        // Continue polling on error
      }
    }, 2000);
  };

  const handleReset = () => {
    setFile(null);
    setJobId(null);
    setJobStatus(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Products</h2>
          <p className="text-gray-600">
            Upload product data from CSV, JSON, or Excel files. Products will be validated and stored in the database.
          </p>
        </div>

        {/* File Upload Area */}
        {!file && (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: CSV, JSON, Excel (Max 50MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Select File
            </label>
          </div>
        )}

        {/* Selected File Info */}
        {file && !isUploading && !jobStatus && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {file && !isUploading && !jobStatus && (
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload and Process
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Processing...</span>
              <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            {jobStatus && (
              <div className="mt-4 text-sm text-gray-600">
                <p>Status: <span className="font-medium">{jobStatus.status}</span></p>
                {jobStatus.total_items > 0 && (
                  <p>
                    Processed: {jobStatus.processed_items} / {jobStatus.total_items} items
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Job Status Results */}
        {jobStatus && (jobStatus.status === 'completed' || jobStatus.status === 'failed') && (
          <div className={`mt-6 p-6 rounded-lg border-2 ${
            jobStatus.status === 'completed'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              {jobStatus.status === 'completed' ? (
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  jobStatus.status === 'completed' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {jobStatus.status === 'completed' ? 'Upload Completed!' : 'Upload Failed'}
                </h3>
                
                {jobStatus.status === 'completed' && jobStatus.result && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Parsed:</span>
                      <span className="font-medium">{jobStatus.result.total_parsed || jobStatus.total_items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valid Products:</span>
                      <span className="font-medium text-green-600">{jobStatus.result.valid || jobStatus.successful_items}</span>
                    </div>
                    {jobStatus.result.invalid > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invalid:</span>
                        <span className="font-medium text-red-600">{jobStatus.result.invalid}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Successfully Created:</span>
                      <span className="font-medium text-green-600">{jobStatus.result.created || jobStatus.successful_items}</span>
                    </div>
                  </div>
                )}

                {jobStatus.status === 'failed' && jobStatus.error_message && (
                  <div className="mt-2">
                    <p className="text-sm text-red-700">{jobStatus.error_message}</p>
                  </div>
                )}

                {jobStatus.errors && jobStatus.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Validation Errors:</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {jobStatus.errors.slice(0, 10).map((error, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-white p-2 rounded">
                          {error.field}: {error.message}
                        </div>
                      ))}
                      {jobStatus.errors.length > 10 && (
                        <p className="text-xs text-gray-500">... and {jobStatus.errors.length - 10} more errors</p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">File Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>CSV: Required columns - name, description, category, price</li>
                <li>JSON: Array of product objects with required fields</li>
                <li>Excel: Same column structure as CSV</li>
                <li>See <code className="bg-blue-100 px-1 rounded">backend/examples/</code> for sample files</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductUpload;

