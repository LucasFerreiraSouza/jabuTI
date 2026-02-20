export type Role = "ESTUDANTE" | "ADMIN";
export type StatusUsuario = "PENDENTE" | "APROVADO" | "REPROVADO";

export type Usuario = {
  _id: string;

  nome: string;
  email: string;
  role: Role;
  status: StatusUsuario;

  avatar?: {
    url: string;
  };

  doisFatoresAtivo: boolean;

  ultimoLogin?: string;

  createdAt?: string;
  updatedAt?: string;
};
