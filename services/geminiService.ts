import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

export const generateQuestion = async (subject: Subject): Promise<Question> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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

  const responseText: string = response.text || "";
  
  if (!responseText) {
    throw new Error("Falha ao obter resposta da IA: o conteúdo retornado está vazio.");
  }

  try {
    return JSON.parse(responseText) as Question;
  } catch (e) {
    console.error("Erro ao parsear JSON da IA:", e);
    throw new Error("Resposta da IA em formato inválido.");
  }
};

export const getExplanation = async (question: string, userAnswer: string, correctAnswer: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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

  return response.text || "Não foi possível carregar a explicação.";
};