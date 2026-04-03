import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileSpreadsheet, Loader2 } from 'lucide-react';
import { getUploadJobStatus, uploadCSV } from '../services/api';
import toast from 'react-hot-toast';

export const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [waitingForEnrichment, setWaitingForEnrichment] = useState(false);

  useEffect(() => {
    if (!waitingForEnrichment || !jobId) {
      return undefined;
    }

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const nextStatus = await getUploadJobStatus(jobId);
        if (cancelled) {
          return;
        }

        setJobStatus(nextStatus);

        if (nextStatus.status === 'completed') {
          toast.success('Upload and LLM enrichment completed. Redirecting to search.');
          navigate(`/search?job=${encodeURIComponent(jobId)}`);
          return;
        }

        if (nextStatus.status === 'completed_with_errors') {
          setWaitingForEnrichment(false);
          toast.error('Upload finished, but LLM enrichment had errors. Search remains blocked for this upload.');
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(`Failed to fetch enrichment status: ${error.message}`);
          setWaitingForEnrichment(false);
        }
      }
    };

    fetchStatus();
    const intervalId = window.setInterval(fetchStatus, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [jobId, navigate, waitingForEnrichment]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const data = await uploadCSV(file);
      const nextJobId = data.job?.job_id || null;
      setJobId(nextJobId);
      setJobStatus(nextJobId ? { job_id: nextJobId, status: 'queued', processed_products: 0, total_products: data.count, completed_batches: 0, failed_batches: 0 } : null);

      if (data.requires_enrichment_completion && nextJobId) {
        setWaitingForEnrichment(true);
        toast.success(`Accepted ${data.count} products. Waiting for LLM enrichment before search opens.`);
      } else {
        toast.success(`Accepted ${data.count} products for upload`);
        navigate(nextJobId ? `/search?job=${encodeURIComponent(nextJobId)}` : '/search');
      }
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const progressPercent = jobStatus?.total_products
    ? Math.min(100, Math.round((jobStatus.processed_products / jobStatus.total_products) * 100))
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center gap-3 mb-6">
          <UploadIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Upload Products</h1>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mb-4"
          >
            Choose CSV File
          </label>

          {file && (
            <div className="mt-4">
              <p className="text-gray-700 font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading || waitingForEnrichment}
            className="w-full mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload Products'}
          </button>
        )}

        {waitingForEnrichment && jobStatus && (
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">LLM Enrichment</p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">Finishing uploaded products before search opens</h2>
                <p className="mt-2 text-sm text-gray-700">
                  Processed {jobStatus.processed_products} of {jobStatus.total_products} products.
                </p>
              </div>
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Status: <strong className="text-gray-900">{jobStatus.status}</strong>
            </div>
          </div>
        )}

      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-2">CSV Format</h3>
        <p className="text-gray-700 mb-2">Your CSV file should have these columns:</p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li><strong>name</strong> - Product name (required)</li>
          <li><strong>description</strong> - Product description</li>
          <li><strong>category</strong> - Product category</li>
          <li><strong>price</strong> - Product price (required)</li>
          <li><strong>currency</strong> - Currency code (USD, EUR, etc.)</li>
          <li><strong>stock_quantity</strong> - Available stock</li>
          <li><strong>seller_name</strong> - Seller name</li>
          <li><strong>image_url</strong> - Product image URL (optional)</li>
        </ul>
        <p className="text-sm text-gray-500 mt-3">
          💡 Tip: Use free image URLs from Unsplash or any direct image link
        </p>
      </div>
    </div>
  );
};

export default Upload;
