
import React, { useState, useEffect, useCallback } from 'react';
import { CellData, GameState, Subject, Question } from './types';
import { generateQuestion } from './services/geminiService';
import Cell from './components/Cell';
import QuestionModal from './components/QuestionModal';
import { Trophy, Heart, Timer, RefreshCw, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

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
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    // Log para depuração na Vercel (ver no console do navegador)
    console.log("Verificando API_KEY...");
    if (!process.env.API_KEY || process.env.API_KEY === "undefined" || process.env.API_KEY === "") {
      console.error("API_KEY não encontrada nas variáveis de ambiente!");
      setApiKeyMissing(true);
    } else {
      console.log("API_KEY detectada com sucesso.");
      setApiKeyMissing(false);
    }
  }, []);

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
    if (gameState === 'playing' && !currentQuestion && !isGeneratingQuestion && !apiKeyMissing) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, currentQuestion, isGeneratingQuestion, apiKeyMissing]);

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
    if (apiKeyMissing) {
      alert("Configuração incompleta: API_KEY ausente nas variáveis de ambiente da Vercel.");
      return;
    }
    setIsGeneratingQuestion(true);
    setPendingMineReveal(index);
    try {
      const question = await generateQuestion(subject);
      setCurrentQuestion(question);
    } catch (error) {
      console.error("Erro ao gerar pergunta:", error);
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

  if (apiKeyMissing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-800 border border-red-500/50 p-8 rounded-2xl shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Ação Necessária na Vercel</h2>
          <p className="text-slate-300 mb-6">
            A variável <strong>API_KEY</strong> não foi injetada. 
            <br/><br/>
            1. Vá em <em>Settings > Environment Variables</em> no painel da Vercel.<br/>
            2. Adicione <strong>API_KEY</strong> com o seu token.<br/>
            3. Vá em <em>Deployments</em> e faça um <strong>Redeploy</strong>.
          </p>
          <div className="bg-slate-900 p-3 rounded text-xs text-slate-400 font-mono text-left">
            Dica: Sem o Redeploy, as novas variáveis não são aplicadas ao site ao vivo.
          </div>
        </div>
      </div>
    );
  }

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
          Explore o campo e use seus conhecimentos escolares e tecnológicos para desarmar as bombas!
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
            <Cell key={cell.id} cell={cell} onClick={() => revealCell(cell.id)} onContextMenu={(e) => toggleFlag(e, cell.id)} />
          ))}
        </div>

        {gameState !== 'playing' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md rounded-xl animate-in zoom-in duration-300 p-6 text-center">
            {gameState === 'won' ? (
              <>
                <Trophy className="w-20 h-20 text-yellow-400 mb-4 animate-bounce" />
                <h2 className="text-4xl font-black text-white mb-2">VOCÊ É FERA!</h2>
                <p className="text-slate-300 mb-6 text-lg">Limpou o campo e provou que domina os conteúdos!</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-white">!</span>
                </div>
                <h2 className="text-4xl font-black text-white mb-2">QUASE LÁ!</h2>
                <p className="text-slate-300 mb-6 text-lg">Suas vidas acabaram, mas cada erro é uma chance de aprender algo novo.</p>
              </>
            )}
            <button onClick={createGrid} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105">
              <RefreshCw className="w-5 h-5" /> Tentar Outra Vez
            </button>
          </div>
        )}

        {isGeneratingQuestion && !currentQuestion && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-xl">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-bold animate-pulse">Professor IA preparando o desafio...</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 text-slate-500 text-sm">
        <p className="italic">💡 Dica: Se você acertar a pergunta da IA, a bomba é desarmada e o espaço fica seguro!</p>
      </div>

      {currentQuestion && (
        <QuestionModal question={currentQuestion} onComplete={handleQuestionComplete} />
      )}
    </div>
  );
}

export default App;