import { http } from "../api/http";

/* ============================
   Tipagens básicas
============================ */

export interface Imagem {
  url: string;
}

export interface Conteudo {
  _id?: string;
  tipo: string;
  titulo?: string;
  descricao?: string;
  texto?: string;
  codigo?: string;
  video?: string;
  imagem?: Imagem;
  exercicio?: any[];
  ordem?: number;
  backgroundColor?: string;
  textColor?: string;
}

export interface Aula {
  _id: string;
  titulo: string;
  descricao: string;
  publicada: boolean;
  ordem: number;
  backgroundColor?: string;
  textColor?: string;
  conteudos: Conteudo[];
  createdAt?: string;
  updatedAt?: string;
}

/* ============================
   LISTAR AULAS
============================ */
export async function listarAulas() {
  const { data } = await http.get<Aula[]>("/aulas");
  return data;
}

/* ============================
   BUSCAR AULA POR ID
============================ */
export async function buscarAulaPorId(id: string) {
  const { data } = await http.get<Aula>(`/aulas/${id}`);
  return data;
}

/* ============================
   CRIAR AULA
============================ */
export interface CriarAulaDTO {
  titulo: string;
  descricao: string;
  publicada?: boolean;
  ordem?: number;
  backgroundColor?: string;
  textColor?: string;
  conteudos?: Conteudo[];
}

export async function criarAula(payload: CriarAulaDTO) {
  const { data } = await http.post<Aula>("/aulas", payload);
  return data;
}

/* ============================
   ATUALIZAR AULA
============================ */
export interface AtualizarAulaDTO {
  titulo?: string;
  descricao?: string;
  publicada?: boolean;
  ordem?: number;
  backgroundColor?: string;
  textColor?: string;
  conteudos?: Conteudo[];
}

export async function atualizarAula(
  id: string,
  payload: AtualizarAulaDTO
) {
  const { data } = await http.put<Aula>(`/aulas/${id}`, payload);
  return data;
}

/* ============================
   DELETAR AULA
============================ */
export async function deletarAula(id: string) {
  const { data } = await http.delete(`/aulas/${id}`);
  return data;
}
