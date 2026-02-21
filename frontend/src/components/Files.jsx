import React, { useEffect, useMemo, useState } from 'react';
import { filesAPI } from '../services/api';

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
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await filesAPI.getAll();
      const data = response.data.files || response.data || [];
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить файлы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

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
      setError(err.response?.data?.message || 'Не удалось загрузить файл');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Удалить файл?')) return;
    try {
      setError('');
      await filesAPI.delete(fileId);
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось удалить файл');
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Files</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={loadFiles}>Обновить</button>
          <label className="btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
            {uploading ? 'Загрузка...' : '+ Загрузить файл'}
            <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {error && (
        <div className="dev-notice" style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
          <span className="dev-notice-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input
          className="home-quick-btn"
          style={{ width: '100%', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left' }}
          placeholder="Поиск файла по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="dev-notice">
          <span className="dev-notice-icon">⏳</span>
          <p>Загружаем файлы...</p>
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
        <h2>Все файлы</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Размер</th>
              <th>Дата загрузки</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file._id}>
                <td>
                  <div className="file-name">
                    <span className="file-icon-small">{getFileIcon(file.type)}</span>
                    {file.name}
                  </div>
                </td>
                <td>{getTypeLabel(file.type)}</td>
                <td>{formatSize(file.size)}</td>
                <td>{formatDate(file.uploadedAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a className="btn-link" href={file.url} target="_blank" rel="noreferrer">Открыть</a>
                    <button className="btn-icon" onClick={() => handleDelete(file._id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredFiles.length && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', opacity: 0.7 }}>
                  Ничего не найдено
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
