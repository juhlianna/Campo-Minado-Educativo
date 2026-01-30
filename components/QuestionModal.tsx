
import React, { useState } from 'react';
import { Question } from '../types';
import { getExplanation } from '../services/geminiService';

interface QuestionModalProps {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected || isLoading) return;
    
    setIsLoading(true);
    try {
      const exp = await getExplanation(question.question, selected, question.correctAnswer);
      setExplanation(exp);
    } catch (error) {
      console.error(error);
      setExplanation("Erro ao carregar explicação da IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    onComplete(selected === question.correctAnswer);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
        {!explanation ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Desafio Detectado!
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-white leading-tight">
              {question.question}
            </h2>
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelected(option)}
                  className={`
                    w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                    ${selected === option 
                      ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                      : 'border-slate-700 bg-slate-700/50 text-slate-300 hover:border-slate-500'}
                  `}
                >
                  <span className="inline-block w-8 font-mono text-indigo-400">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selected || isLoading}
              className={`
                mt-8 w-full py-3 rounded-lg font-bold text-white transition-all
                ${!selected || isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg'}
              `}
            >
              {isLoading ? 'IA Analisando...' : 'Confirmar Resposta'}
            </button>
          </>
        ) : (
          <div className="animate-in fade-in duration-500">
            <h3 className={`text-2xl font-bold mb-4 ${selected === question.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
              {selected === question.correctAnswer ? 'Muito bem! Resposta Correta' : 'Oops! Não foi desta vez'}
            </h3>
            <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700 mb-6">
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {explanation}
              </p>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-white transition-all"
            >
              Continuar Jogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;
