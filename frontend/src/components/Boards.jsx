import React, { useEffect, useMemo, useState } from 'react';
import { boardsAPI } from '../services/api';

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#4066ff');
  const [creating, setCreating] = useState(false);

  const loadBoards = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await boardsAPI.getAll();
      const data = response.data.boards || response.data || [];
      setBoards(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить доски');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

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
      setError(err.response?.data?.message || 'Не удалось создать доску');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm('Удалить доску и все связанные задачи?')) return;
    try {
      setError('');
      await boardsAPI.delete(boardId);
      setBoards((prev) => prev.filter((board) => board._id !== boardId));
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось удалить доску');
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Boards</h1>
        <button className="btn-primary" onClick={loadBoards}>Обновить</button>
      </div>

      {error && (
        <div className="dev-notice" style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
          <span className="dev-notice-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 140px 140px', marginBottom: 20 }}>
        <input
          className="home-quick-btn"
          style={{ border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left' }}
          placeholder="Название новой доски"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
        />
        <input
          type="color"
          value={newBoardColor}
          onChange={(e) => setNewBoardColor(e.target.value)}
          style={{ width: '100%', minHeight: 44, borderRadius: 10, border: 'none', background: 'transparent' }}
        />
        <button className="btn-primary" onClick={handleCreateBoard} disabled={creating || !newBoardName.trim()}>
          {creating ? 'Создание...' : '+ Создать'}
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          className="home-quick-btn"
          style={{ width: '100%', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left' }}
          placeholder="Поиск доски по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="dev-notice">
          <span className="dev-notice-icon">⏳</span>
          <p>Загружаем доски...</p>
        </div>
      ) : (
        <>
      <div className="boards-grid">
        {filteredBoards.map((board) => (
          <div key={board._id} className="board-card" style={{ borderLeft: `4px solid ${board.color || '#4066ff'}` }}>
            <h3>{board.name}</h3>
            <p>{getTasksCount(board)} активных задач</p>
            <div className="board-footer">
              <span className="board-status">Активна</span>
              <button className="btn-link" onClick={() => handleDeleteBoard(board._id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>

      <div className="board-list">
        <h2>Все доски</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Задачи</th>
              <th>Статус</th>
              <th>Последнее обновление</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredBoards.map((board) => (
              <tr key={board._id}>
                <td>
                  <div className="board-name">
                    <div className="color-indicator" style={{ backgroundColor: board.color || '#4066ff' }}></div>
                    {board.name}
                  </div>
                </td>
                <td>{getTasksCount(board)}</td>
                <td><span className="status-badge">Активна</span></td>
                <td>{formatDate(board.updatedAt || board.createdAt)}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleDeleteBoard(board._id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {!filteredBoards.length && (
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

export default Boards;
