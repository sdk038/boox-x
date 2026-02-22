import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { filesAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const getFileIcon = (type) => {
  const lower = String(type || '').toLowerCase();
  const icons = {
    'application/pdf': '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'image/png': '🖼️',
    'image/jpeg': '🖼️',
    'image/jpg': '🖼️',
    'image/gif': '🖼️',
    'application/zip': '🗜️',
    'text/plain': '📄'
  };
  return icons[lower] || '📁';
};

const Files = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await filesAPI.getAll();
      const data = response.data.files || response.data || [];
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || t('files.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter((file) => file.name?.toLowerCase().includes(q));
  }, [files, search]);

  const formatSize = (size) => {
    if (!Number.isFinite(size)) return '—';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const getTypeLabel = (mimeType) => {
    if (!mimeType) return '—';
    const parts = String(mimeType).split('/');
    return parts[parts.length - 1].toUpperCase();
  };

  const handleUpload = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', selected);
      const response = await filesAPI.upload(formData);
      if (response.data?.file) {
        setFiles((prev) => [response.data.file, ...prev]);
      } else {
        await loadFiles();
      }
    } catch (err) {
      setError(err.response?.data?.message || t('files.uploadError'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm(t('files.confirmDelete'))) return;
    try {
      setError('');
      await filesAPI.delete(fileId);
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
    } catch (err) {
      setError(err.response?.data?.message || t('files.deleteError'));
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>{t('files.title')}</h1>
        <div className="files-header-actions">
          <button className="btn-primary" onClick={loadFiles}>{t('common.refresh')}</button>
          <label className={`btn-primary file-upload-label ${uploading ? 'is-loading' : ''}`}>
            {uploading ? t('files.uploading') : `+ ${t('files.upload')}`}
            <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {error && (
        <div className="dev-notice dev-notice-error">
          <span className="dev-notice-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <div className="files-search-wrap">
        <input
          className="home-quick-btn file-search-input"
          placeholder={t('files.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="dev-notice">
          <span className="dev-notice-icon">⏳</span>
          <p>{t('files.loadingFiles')}</p>
        </div>
      ) : (
        <>
      <div className="files-grid">
        {filteredFiles.map((file) => (
          <div key={file._id} className="file-card">
            <div className="file-icon">{getFileIcon(file.type)}</div>
            <div className="file-details">
              <h4>{file.name}</h4>
              <p>{formatSize(file.size)} • {formatDate(file.uploadedAt)}</p>
            </div>
            <button className="btn-icon" onClick={() => handleDelete(file._id)}>🗑️</button>
          </div>
        ))}
      </div>
      <div className="file-list">
        <h2>{t('files.allFiles')}</h2>
        <table className="data-table mobile-data-table">
          <thead>
            <tr>
              <th>{t('files.colName')}</th>
              <th>{t('files.colType')}</th>
              <th>{t('files.colSize')}</th>
              <th>{t('files.colDate')}</th>
              <th>{t('files.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file._id}>
                <td data-label={t('files.colName')}>
                  <div className="file-name">
                    <span className="file-icon-small">{getFileIcon(file.type)}</span>
                    {file.name}
                  </div>
                </td>
                <td data-label={t('files.colType')}>{getTypeLabel(file.type)}</td>
                <td data-label={t('files.colSize')}>{formatSize(file.size)}</td>
                <td data-label={t('files.colDate')}>{formatDate(file.uploadedAt)}</td>
                <td data-label={t('files.colActions')}>
                  <div className="file-actions-cell">
                    <a className="btn-link" href={file.url} target="_blank" rel="noreferrer">{t('files.open')}</a>
                    <button className="btn-icon" onClick={() => handleDelete(file._id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredFiles.length && (
              <tr>
                <td colSpan="5" className="table-empty">
                  {t('common.notFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
};

export default Files;
