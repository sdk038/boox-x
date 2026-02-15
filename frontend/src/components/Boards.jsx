import React, { useState } from 'react';

const Boards = () => {
  const [boards] = useState([
    { id: 1, name: 'Маркетинг', tasks: 12, color: '#4066ff' },
    { id: 2, name: 'Разработка', tasks: 24, color: '#f44336' },
    { id: 3, name: 'Дизайн', tasks: 8, color: '#ff9800' },
    { id: 4, name: 'Продажи', tasks: 15, color: '#4caf50' }
  ]);

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Boards</h1>
        <button className="btn-primary">+ Создать доску</button>
      </div>
      <div className="boards-grid">
        {boards.map(board => (
          <div key={board.id} className="board-card" style={{ borderLeft: `4px solid ${board.color}` }}>
            <h3>{board.name}</h3>
            <p>{board.tasks} активных задач</p>
            <div className="board-footer">
              <span className="board-status">Активна</span>
              <button className="btn-link">Открыть →</button>
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
            {boards.map(board => (
              <tr key={board.id}>
                <td>
                  <div className="board-name">
                    <div className="color-indicator" style={{ backgroundColor: board.color }}></div>
                    {board.name}
                  </div>
                </td>
                <td>{board.tasks}</td>
                <td><span className="status-badge">Активна</span></td>
                <td>2 часа назад</td>
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

export default Boards;
