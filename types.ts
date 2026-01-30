
export type CellStatus = 'hidden' | 'revealed' | 'flagged';

export interface CellData {
  id: number;
  row: number;
  col: number;
  isMine: boolean;
  status: CellStatus;
  neighborMines: number;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export type GameState = 'playing' | 'won' | 'lost';

export enum Subject {
  Math = 'Matemática',
  Science = 'Ciências da Natureza',
  Technology = 'Iniciação à Tecnologia',
  History = 'História',
  Geography = 'Geografia',
  Portuguese = 'Língua Portuguesa',
  General = 'Atualidades e Cultura'
}
