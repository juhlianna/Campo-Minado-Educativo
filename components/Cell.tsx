
import React from 'react';
import { CellData } from '../types';

interface CellProps {
  cell: CellData;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const Cell: React.FC<CellProps> = ({ cell, onClick, onContextMenu }) => {
  const getCellContent = () => {
    if (cell.status === 'flagged') return '🚩';
    if (cell.status === 'hidden') return '';
    if (cell.isMine) return '💣';
    return cell.neighborMines > 0 ? cell.neighborMines : '';
  };

  const getCellStyles = () => {
    if (cell.status === 'hidden') return 'bg-slate-700 hover:bg-slate-600 border-slate-600 cursor-pointer';
    if (cell.status === 'flagged') return 'bg-slate-700 border-slate-600 cursor-pointer text-red-400';
    if (cell.isMine) return 'bg-red-500 border-red-400 text-white';
    return 'bg-slate-800 border-slate-700 text-slate-300';
  };

  const getTextColor = () => {
    const colors: Record<number, string> = {
      1: 'text-blue-400',
      2: 'text-green-400',
      3: 'text-red-400',
      4: 'text-purple-400',
      5: 'text-yellow-400',
      6: 'text-cyan-400',
      7: 'text-orange-400',
      8: 'text-pink-400',
    };
    return colors[cell.neighborMines] || 'text-slate-300';
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        w-8 h-8 md:w-10 md:h-10 border-2 rounded-md flex items-center justify-center font-bold text-lg transition-all duration-200
        ${getCellStyles()}
        ${cell.status === 'revealed' && !cell.isMine ? getTextColor() : ''}
        select-none shadow-sm
      `}
    >
      {getCellContent()}
    </div>
  );
};

export default Cell;
