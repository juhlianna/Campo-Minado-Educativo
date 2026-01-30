import React, { useState, useEffect, useCallback } from 'react';
import { CellData, GameState, Subject, Question } from './types';
import { generateQuestion } from './services/geminiService';
import Cell from './components/Cell';
import QuestionModal from './components/QuestionModal';
import { Trophy, Heart, Timer, RefreshCw, GraduationCap, BookOpen } from 'lucide-react';

const ROWS = 10;
const COLS = 10;
const MINES_COUNT = 15;
const INITIAL_LIVES = 3;

function App() {
  const [grid, setGrid] = useState<CellData[]>([]);
  const [gameState, setGameState] = useState('playing' as GameState);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [timer, setTimer] = useState(0);
  const [subject, setSubject] = useState<Subject>(Subject.Technology);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [pendingMineReveal, setPendingMineReveal] = useState<number | null>(null);
  const [safeCellsCount, setSafeCellsCount] = useState(0);

  const createGrid = useCallback(() => {
    const totalCells = ROWS * COLS;
    const newGrid: CellData[] = [];
    
    for (let i = 0; i < totalCells; i++) {
      newGrid.push({
        id: i,
        row: Math.floor(i / COLS),
        col: i % COLS,
        isMine: false,
        status: 'hidden',
        neighborMines: 0,
      });
    }

    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const randomIndex = Math.floor(Math.random() * totalCells);
      if (!newGrid[randomIndex].isMine) {
        newGrid[randomIndex].isMine = true;
        minesPlaced++;
      }
    }

    for (let i = 0; i < totalCells; i++) {
      if (!newGrid[i].isMine) {
        let count = 0;
        const row = newGrid[i].row;
        const col = newGrid[i].col;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              if (newGrid[nr * COLS + nc].isMine) count++;
            }
          }
        }
        newGrid[i].neighborMines = count;
      }
    }

    setGrid(newGrid);
    setGameState('playing');
    setLives(INITIAL_LIVES);
    setTimer(0);
    setSafeCellsCount(totalCells - MINES_COUNT);
  }, []);

  useEffect(() => {
    createGrid();
  }, [createGrid]);

  useEffect(() => {
    let interval: any;
    if (gameState === 'playing' && !currentQuestion && !isGeneratingQuestion) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, currentQuestion, isGeneratingQuestion]);

  const revealCell = (index: number) => {
    if (gameState !== 'playing' || grid[index].status !== 'hidden' || isGeneratingQuestion) return;
    const newGrid = [...grid];
    if (newGrid[index].isMine) {
      handleMineHit(index);
      return;
    }
    floodFill(newGrid, index);
    setGrid(newGrid);
    checkWinCondition(newGrid);
  };

  const handleMineHit = async (index: number) => {
    setIsGeneratingQuestion(true);
    setPendingMineReveal(index);
    try {
      const question = await generateQuestion(subject);
      setCurrentQuestion(question);
    } catch (error) {
      console.error(error);
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) setGameState('lost');
        return next;
      });
      const newGrid = [...grid];
      newGrid[index].status = 'revealed';
      setGrid(newGrid);
      setIsGeneratingQuestion(false);
      setPendingMineReveal(null);
    }
  };

  const handleQuestionComplete = (isCorrect: boolean) => {
    const index = pendingMineReveal!;
    const newGrid = [...grid];
    if (isCorrect) {
      newGrid[index].isMine = false;
      newGrid[index].status = 'revealed';
    } else {
      newGrid[index].status = 'revealed';
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setGameState('lost');
        newGrid.forEach(c => { if (c.isMine) c.status = 'revealed'; });
      }
    }
    setGrid(newGrid);
    setCurrentQuestion(null);
    setIsGeneratingQuestion(false);
    setPendingMineReveal(null);
    checkWinCondition(newGrid);
  };

  const floodFill = (newGrid: CellData[], index: number) => {
    if (newGrid[index].status !== 'hidden' || newGrid[index].isMine) return;
    newGrid[index].status = 'revealed';
    if (newGrid[index].neighborMines === 0) {
      const row = newGrid[index].row;
      const col = newGrid[index].col;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            floodFill(newGrid, nr * COLS + nc);
          }
        }
      }
    }
  };

  const toggleFlag = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || grid[index].status === 'revealed') return;
    const newGrid = [...grid];
    newGrid[index].status = newGrid[index].status === 'flagged' ? 'hidden' : 'flagged';
    setGrid(newGrid);
  };

  const checkWinCondition = (currentGrid: CellData[]) => {
    const revealedSafe = currentGrid.filter(c => !c.isMine && c.status === 'revealed').length;
    if (revealedSafe === safeCellsCount) setGameState('won');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl flex flex-col items-center mb-8 text-center">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-10 h-10 text-indigo-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Campo Minado Educativo
          </h1>
        </div>
        <p className="text-slate-400 max-w-xl">
          Explore o campo e use seus conhecimentos para desarmar as bombas!
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Heart className={`w-6 h-6 ${lives > 1 ? 'text-red-500' : 'text-red-600 animate-pulse'}`} fill="currentColor" />
            <span className="text-lg font-bold">Vidas</span>
          </div>
          <div className="flex gap-1">
            {[...Array(INITIAL_LIVES)].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? 'bg-red-500' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Timer className="w-6 h-6 text-indigo-400" />
            <span className="text-lg font-bold">Tempo</span>
          </div>
          <span className="font-mono text-xl text-indigo-300">{formatTime(timer)}</span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span className="text-lg font-bold">Matéria</span>
          </div>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            {Object.values(Subject).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative p-4 bg-slate-800 border-4 border-slate-700 rounded-2xl shadow-2xl">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {grid.map((cell) => (
            <Cell key={cell.id} cell={cell} onClick={(e) => revealCell(cell.id)} onContextMenu={(e) => toggleFlag(e, cell.id)} />
          ))}
        </div>

        {gameState !== 'playing' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md rounded-xl p-6 text-center">
            {gameState === 'won' ? (
              <>
                <Trophy className="w-20 h-20 text-yellow-400 mb-4 animate-bounce" />
                <h2 className="text-4xl font-black text-white mb-2">VITÓRIA!</h2>
                <button onClick={createGrid} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" /> Jogar Novamente
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black text-white mb-2">FIM DE JOGO</h2>
                <button onClick={createGrid} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" /> Tentar Novamente
                </button>
              </>
            )}
          </div>
        )}

        {isGeneratingQuestion && !currentQuestion && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-xl">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-bold animate-pulse">Gerando desafio educativo...</p>
          </div>
        )}
      </div>

      {currentQuestion && (
        <QuestionModal question={currentQuestion} onComplete={handleQuestionComplete} />
      )}
    </div>
  );
}

export default App;