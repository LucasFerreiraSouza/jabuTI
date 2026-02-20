export type RespostaExercicio = {
  _id: string;
  usuario: string;

  respostaEscolhida: number;
  correta: boolean;
  dataResposta: string;

  tempoSegundos: number;
  dentroDoTempo: boolean;
};

export type Exercicio = {
  _id: string;

  pergunta: string;
  alternativas: string[];
  respostaCorreta: number;

  acertos: number;
  erros: number;

  tempoLimiteSegundos: number;

  respostas: RespostaExercicio[];
};

export type ConteudoTipo =
  | "texto"
  | "video"
  | "codigo"
  | "imagem"
  | "exercicio";

export type Conteudo = {
  _id: string;

  tipo: ConteudoTipo;

  titulo?: string;
  descricao?: string;
  texto?: string;
  codigo?: string;
  video?: string;

  imagem?: {
    url: string;
  };

  exercicio?: Exercicio[];

  ordem: number;

  backgroundColor: string;
  textColor: string;

  criadoPor?: string;
  criadoPorUsername?: string;

  createdAt?: string;
  updatedAt?: string;
};

export type Aula = {
  _id: string;

  titulo: string;
  descricao: string;

  publicada: boolean;
  ordem: number;

  backgroundColor: string;
  textColor: string;

  conteudos: Conteudo[];

  criadoPor: string;

  createdAt?: string;
  updatedAt?: string;
};

export type SiteConfig = {
  _id: string;

  backgroundColorSite: string;
  textColorSite: string;

  createdAt?: string;
  updatedAt?: string;
};
