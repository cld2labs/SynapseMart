import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileSpreadsheet } from 'lucide-react';
import { uploadCSV } from '../services/api';
import toast from 'react-hot-toast';

export const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      const jobId = data.job?.job_id;
      toast.success(`Accepted ${data.count} products for background processing`);
      navigate(jobId ? `/search?job=${encodeURIComponent(jobId)}` : '/search');
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

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
            disabled={uploading}
            className="w-full mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload Products'}
          </button>
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
