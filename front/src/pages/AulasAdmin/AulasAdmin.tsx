import { useEffect, useState } from "react";

import type { Aula } from "../../services/aulas.service";
import {
  listarAulas,
  criarAula,
  deletarAula,
} from "../../services/aulas.service";

import { adminService } from "../../services/admin.service";
import type { Usuario } from "../../types/usuarios.type";

export default function AulasAdmin() {
  /* ===============================
     AULAS
  =============================== */
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loadingAulas, setLoadingAulas] = useState(false);

  async function carregarAulas() {
    try {
      setLoadingAulas(true);
      const data = await listarAulas();
      setAulas(data);
    } catch (error) {
      console.error("Erro ao carregar aulas", error);
      alert("Erro ao carregar aulas");
    } finally {
      setLoadingAulas(false);
    }
  }

  useEffect(() => {
    carregarAulas();
    carregarUsuarios();
  }, []);

  async function handleCriarAula() {
    try {
      const novaAula = await criarAula({
        titulo: "Nova aula",
        descricao: "Descrição da nova aula",
        publicada: false,
        ordem: aulas.length + 1,
        conteudos: [],
      });

      setAulas((prev) => [...prev, novaAula]);
    } catch (error) {
      console.error("Erro ao criar aula", error);
      alert("Erro ao criar aula");
    }
  }

  async function handleDeletarAula(id: string) {
    const confirmar = window.confirm("Deseja realmente remover esta aula?");
    if (!confirmar) return;

    try {
      await deletarAula(id);
      setAulas((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Erro ao deletar aula", error);
      alert("Erro ao deletar aula");
    }
  }

  /* ===============================
     USUÁRIOS (ADMIN)
  =============================== */

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoRole, setNovoRole] = useState<"ESTUDANTE" | "ADMIN">("ESTUDANTE");

  async function carregarUsuarios() {
    try {
      setLoadingUsuarios(true);

      const response = await adminService.listarUsuarios();
      setUsuarios(response.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar usuários");
    } finally {
      setLoadingUsuarios(false);
    }
  }

  async function handleCriarUsuario() {
    if (!novoNome || !novoEmail) {
      alert("Informe nome e email");
      return;
    }

    try {
      const response = await adminService.criarUsuario({
        nome: novoNome,
        email: novoEmail,
        role: novoRole,
      });

      setUsuarios((prev) => [...prev, response.data]);

      setNovoNome("");
      setNovoEmail("");
      setNovoRole("ESTUDANTE");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar usuário");
    }
  }


  async function handleRemoverUsuario(id: string) {
    const ok = window.confirm("Deseja remover este usuário?");
    if (!ok) return;

    try {
      await adminService.deletarUsuario(id);

      setUsuarios((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao remover usuário");
    }
  }

  async function handleAprovarUsuario(id: string) {
    try {
      await adminService.aprovarUsuario(id);
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      alert("Erro ao aprovar usuário");
    }
  }

  async function handleReprovarUsuario(id: string) {
    try {
      await adminService.reprovarUsuario(id);
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      alert("Erro ao reprovar usuário");
    }
  }

  async function handlePromoverAdmin(id: string) {
    try {
      await adminService.promoverAdmin(id);
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      alert("Erro ao promover usuário");
    }
  }

  async function handleDespromoverAdmin(id: string) {
    try {
      await adminService.despromoverAdmin(id);
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      alert("Erro ao despromover usuário");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      {/* ============================
          AULAS
      ============================ */}
      <h1>Administração de aulas</h1>

      <button onClick={handleCriarAula}>Nova aula</button>

      {loadingAulas && <p>Carregando aulas...</p>}

      {!loadingAulas && aulas.length === 0 && (
        <p>Nenhuma aula cadastrada</p>
      )}

      <ul>
        {aulas.map((aula) => (
          <li key={aula._id} style={{ marginBottom: 12 }}>
            <strong>{aula.titulo}</strong>
            <br />
            <span>{aula.descricao}</span>
            <br />
            <small>Publicada: {aula.publicada ? "Sim" : "Não"}</small>
            <br />

            <button
              onClick={() => handleDeletarAula(aula._id)}
              style={{ marginTop: 6 }}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <hr style={{ margin: "32px 0" }} />

      {/* ============================
          USUÁRIOS
      ============================ */}

      <h1>Administração de usuários</h1>

      <div style={{ marginBottom: 16 }}>
        <h3>Novo usuário</h3>

        <input
          placeholder="Nome"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
        />

        <input
          placeholder="Email"
          value={novoEmail}
          onChange={(e) => setNovoEmail(e.target.value)}
          style={{ marginLeft: 8 }}
        />

        <select
          value={novoRole}
          onChange={(e) =>
            setNovoRole(e.target.value as "ESTUDANTE" | "ADMIN")
          }
          style={{ marginLeft: 8 }}
        >
          <option value="ESTUDANTE">Estudante</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button onClick={handleCriarUsuario} style={{ marginLeft: 8 }}>
          Criar
        </button>
      </div>

      {loadingUsuarios && <p>Carregando usuários...</p>}

      {!loadingUsuarios && usuarios.length === 0 && (
        <p>Nenhum usuário encontrado</p>
      )}

      <ul>
        {usuarios.map((u) => (
          <li key={u._id} style={{ marginBottom: 14 }}>
            <strong>{u.nome}</strong> — {u.email}
            <br />
            <small>
              Role: {u.role} | Status: {u.status}
            </small>
            <br />

            {u.status !== "APROVADO" && (
              <button onClick={() => handleAprovarUsuario(u._id)}>
                Aprovar
              </button>
            )}

            {u.status !== "REPROVADO" && (
              <button
                onClick={() => handleReprovarUsuario(u._id)}
                style={{ marginLeft: 6 }}
              >
                Reprovar
              </button>
            )}

            {u.role !== "ADMIN" && (
              <button
                onClick={() => handlePromoverAdmin(u._id)}
                style={{ marginLeft: 6 }}
              >
                Promover para admin
              </button>
            )}

            {u.role === "ADMIN" && (
              <button
                onClick={() => handleDespromoverAdmin(u._id)}
                style={{ marginLeft: 6 }}
              >
                Despromover
              </button>
            )}

            <button
              onClick={() => handleRemoverUsuario(u._id)}
              style={{ marginLeft: 6 }}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}