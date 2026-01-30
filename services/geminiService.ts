
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestion = async (subject: Subject): Promise<Question> => {
  const isTech = subject === Subject.Technology;
  
  const prompt = `
    Atue como um professor especialista do Ensino Fundamental 2 (Brasil).
    Gere uma pergunta de múltipla escolha para alunos de 10 a 15 anos sobre o tema: ${subject}.
    ${isTech ? 'Foque em raciocínio lógico, algoritmos, lógica de programação (loops, condicionais), sistemas binários ou pensamento computacional.' : 'A pergunta deve seguir os parâmetros da BNCC, ser desafiadora mas adequada para a idade.'}
    Certifique-se de que as opções sejam plausíveis.
    Linguagem: Português (Brasil).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "A pergunta educativa." },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Quatro opções de resposta." 
          },
          correctAnswer: { type: Type.STRING, description: "A opção correta (texto idêntico ao do array)." }
        },
        required: ["question", "options", "correctAnswer"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getExplanation = async (question: string, userAnswer: string, correctAnswer: string): Promise<string> => {
  const isCorrect = userAnswer === correctAnswer;
  const prompt = `
    Você é um tutor educativo para alunos de 10 a 15 anos.
    Pergunta: ${question}
    Resposta do aluno: ${userAnswer}
    Resposta correta: ${correctAnswer}
    
    Status: ${isCorrect ? 'O aluno acertou' : 'O aluno errou'}.
    
    Tarefa: Explique de forma didática e clara o conceito por trás da pergunta. 
    Se a pergunta for de tecnologia/lógica, use analogias do cotidiano para explicar o algoritmo ou a lógica envolvida.
    Se o aluno errou, não o desanime; explique o porquê do erro de forma construtiva.
    Use um tom encorajador, adequado para adolescentes.
    Linguagem: Português (Brasil). Limite-se a um parágrafo médio.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });

  return response.text || "Não foi possível carregar a explicação no momento.";
};
