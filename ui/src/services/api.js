// Use relative paths in production (nginx proxy handles /api)
// Use explicit URL in development
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(errorData.detail || errorData.error || 'Upload failed');
  }
  return response.json();
};

export const getUploadJobStatus = async (jobId) => {
  const response = await fetch(`${API_URL}/api/upload-jobs/${jobId}`);
  if (!response.ok) throw new Error('Failed to fetch upload job status');
  return response.json();
};

export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}/api/products?${params}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const searchProducts = async (query) => {
  const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Search failed');
  return response.json();
};

export const getCategories = async () => {
  const response = await fetch(`${API_URL}/api/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const clearDatabase = async () => {
  const response = await fetch(`${API_URL}/api/products/clear`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to clear database' }));
    throw new Error(errorData.detail || errorData.error || 'Failed to clear database');
  }
  return response.json();
};
