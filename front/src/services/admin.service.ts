import { http } from "../api/http";
import type { Usuario } from "../types/usuarios.type";

/* ============================
   DTOs
============================ */

export interface CriarUsuarioPayload {
  nome: string;
  email: string;
  role?: "ESTUDANTE" | "ADMIN";
}

export type AtualizarUsuarioPayload = Partial<{
  nome: string;
  email: string;
  role: "ESTUDANTE"  | "ADMIN";
  status: "PENDENTE" | "APROVADO" | "REPROVADO";
}>;

/* ============================
   Service
============================ */

export const adminService = {
  /* ----------------------------
     Usuários
  ---------------------------- */

  listarUsuarios() {
    return http.get<Usuario[]>("/admin");
  },

  buscarUsuarioPorId(id: string) {
    return http.get<Usuario>(`/admin/${id}`);
  },

  criarUsuario(payload: CriarUsuarioPayload) {
    return http.post("/admin", payload);
  },

  atualizarUsuario(id: string, payload: AtualizarUsuarioPayload) {
    return http.put<Usuario>(`/admin/${id}`, payload);
  },

  deletarUsuario(id: string) {
    return http.delete(`/admin/${id}`);
  },

  /* ----------------------------
     Fluxo de aprovação
  ---------------------------- */

  aprovarUsuario(id: string) {
    return http.patch(`/admin/${id}/aprovar`);
  },

  reprovarUsuario(id: string) {
    return http.patch(`/admin/${id}/reprovar`);
  },

  aprovacaoAutomatica() {
    return http.patch("/admin/config/aprovacao-automatica");
  },

  /* ----------------------------
     Controle de perfil
  ---------------------------- */

  promoverAdmin(id: string) {
    return http.patch(`/admin/${id}/promover-admin`);
  },

  despromoverAdmin(id: string) {
    return http.patch(`/admin/${id}/despromover-admin`);
  }
};
