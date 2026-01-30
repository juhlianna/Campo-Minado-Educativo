import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

const getAIInstance = () => {
  // Tenta obter de process.env (injetado pelo Vite)
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateQuestion = async (subject: Subject): Promise<Question> => {
  const ai = getAIInstance();
  if (!ai) throw new Error("Configuração de API_KEY ausente nas variáveis de ambiente.");

  const isTech = subject === Subject.Technology;
  
  const prompt = `
    Atue como um professor especialista do Ensino Fundamental 2 (Brasil).
    Gere uma pergunta de múltipla escolha sobre o tema: ${subject}.
    ${isTech ? 'Foque em raciocínio lógico, algoritmos, lógica de programação, sistemas binários ou pensamento computacional.' : 'A pergunta deve ser desafiadora mas adequada para o nível escolar.'}
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
          question: { type: Type.STRING },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING }
        },
        required: ["question", "options", "correctAnswer"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getExplanation = async (question: string, userAnswer: string, correctAnswer: string): Promise<string> => {
  const ai = getAIInstance();
  if (!ai) return "Chave de API não configurada corretamente.";

  const isCorrect = userAnswer === correctAnswer;
  const prompt = `
    Você é um tutor educativo.
    Pergunta: ${question}
    Resposta do aluno: ${userAnswer}
    Resposta correta: ${correctAnswer}
    
    Status: ${isCorrect ? 'O aluno acertou' : 'O aluno errou'}.
    
    Tarefa: Explique de forma didática e clara o conceito por trás da pergunta. 
    Use um tom encorajador e didático em Português (Brasil).
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