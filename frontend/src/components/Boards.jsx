import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { boardsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Boards = () => {
  const { t } = useLanguage();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#4066ff');
  const [creating, setCreating] = useState(false);

  const loadBoards = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await boardsAPI.getAll();
      const data = response.data.boards || response.data || [];
      setBoards(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || t('boards.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const filteredBoards = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return boards;
    return boards.filter((board) => board.name?.toLowerCase().includes(q));
  }, [boards, search]);

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTasksCount = (board) => Array.isArray(board.tasks) ? board.tasks.length : 0;

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    try {
      setCreating(true);
      setError('');
      const response = await boardsAPI.create({
        name: newBoardName.trim(),
        color: newBoardColor
      });
      const created = response.data.board;
      setBoards((prev) => [created, ...prev]);
      setNewBoardName('');
      setNewBoardColor('#4066ff');
    } catch (err) {
      setError(err.response?.data?.message || t('boards.createError'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm(t('boards.confirmDelete'))) return;
    try {
      setError('');
      await boardsAPI.delete(boardId);
      setBoards((prev) => prev.filter((board) => board._id !== boardId));
    } catch (err) {
      setError(err.response?.data?.message || t('boards.deleteError'));
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>{t('boards.title')}</h1>
        <button className="btn-primary" onClick={loadBoards}>{t('common.refresh')}</button>
      </div>

      {error && (
        <div className="dev-notice dev-notice-error">
          <span className="dev-notice-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <div className="boards-create-form">
        <input
          className="home-quick-btn board-input"
          placeholder={t('boards.createPlaceholder')}
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
        />
        <input
          type="color"
          value={newBoardColor}
          onChange={(e) => setNewBoardColor(e.target.value)}
          className="board-color-input"
        />
        <button className="btn-primary" onClick={handleCreateBoard} disabled={creating || !newBoardName.trim()}>
          {creating ? t('boards.creating') : `+ ${t('common.create')}`}
        </button>
      </div>

      <div className="board-search-wrap">
        <input
          className="home-quick-btn board-search-input"
          placeholder={t('boards.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="dev-notice">
          <span className="dev-notice-icon">⏳</span>
          <p>{t('boards.loadingBoards')}</p>
        </div>
      ) : (
        <>
      <div className="boards-grid">
        {filteredBoards.map((board) => (
          <div key={board._id} className="board-card" style={{ borderLeft: `4px solid ${board.color || '#4066ff'}` }}>
            <h3>{board.name}</h3>
            <p>{getTasksCount(board)} {t('boards.activeTasks')}</p>
            <div className="board-footer">
              <span className="board-status">{t('boards.active')}</span>
              <button className="btn-link" onClick={() => handleDeleteBoard(board._id)}>{t('common.delete')}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="board-list">
        <h2>{t('boards.allBoards')}</h2>
        <table className="data-table mobile-data-table">
          <thead>
            <tr>
              <th>{t('boards.colName')}</th>
              <th>{t('boards.colTasks')}</th>
              <th>{t('boards.colStatus')}</th>
              <th>{t('boards.colUpdated')}</th>
              <th>{t('boards.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredBoards.map((board) => (
              <tr key={board._id}>
                <td data-label={t('boards.colName')}>
                  <div className="board-name">
                    <div className="color-indicator" style={{ backgroundColor: board.color || '#4066ff' }}></div>
                    {board.name}
                  </div>
                </td>
                <td data-label={t('boards.colTasks')}>{getTasksCount(board)}</td>
                <td data-label={t('boards.colStatus')}><span className="status-badge">{t('boards.active')}</span></td>
                <td data-label={t('boards.colUpdated')}>{formatDate(board.updatedAt || board.createdAt)}</td>
                <td data-label={t('boards.colActions')}>
                  <button className="btn-icon" onClick={() => handleDeleteBoard(board._id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {!filteredBoards.length && (
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

export default Boards;
