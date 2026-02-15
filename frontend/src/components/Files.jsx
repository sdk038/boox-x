import React, { useState } from 'react';

const getFileIcon = (type) => {
  const icons = {
    'PDF': '📄',
    'Figma': '🎨',
    'Word': '📝',
    'Excel': '📊'
  };
  return icons[type] || '📁';
};

const Files = () => {
  const [files] = useState([
    { id: 1, name: 'Презентация.pdf', size: '2.4 MB', type: 'PDF', date: '15.02.2026' },
    { id: 2, name: 'Дизайн_макет.fig', size: '5.8 MB', type: 'Figma', date: '14.02.2026' },
    { id: 3, name: 'Документация.docx', size: '1.2 MB', type: 'Word', date: '13.02.2026' },
    { id: 4, name: 'Бюджет.xlsx', size: '856 KB', type: 'Excel', date: '12.02.2026' }
  ]);

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Files</h1>
        <button className="btn-primary">+ Загрузить файл</button>
      </div>
      <div className="files-grid">
        {files.map(file => (
          <div key={file.id} className="file-card">
            <div className="file-icon">{getFileIcon(file.type)}</div>
            <div className="file-details">
              <h4>{file.name}</h4>
              <p>{file.size} • {file.date}</p>
            </div>
            <button className="btn-icon">⋯</button>
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
            {files.map(file => (
              <tr key={file.id}>
                <td>
                  <div className="file-name">
                    <span className="file-icon-small">{getFileIcon(file.type)}</span>
                    {file.name}
                  </div>
                </td>
                <td>{file.type}</td>
                <td>{file.size}</td>
                <td>{file.date}</td>
                <td>
                  <button className="btn-icon">⋯</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Files;
