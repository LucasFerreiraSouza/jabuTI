import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CadastrarSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMensagem(null);
    setErro(null);

    if (!token) {
      setErro("Token inválido.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/cadastro/ativar-senha/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token,
            senha
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErro(data?.erro || "Erro ao cadastrar senha.");
        return;
      }

      setMensagem(data.mensagem || "Senha cadastrada com sucesso.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Cadastrar senha</h2>

      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: 12 }}>
          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Confirmar senha</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>

        {erro && (
          <p style={{ color: "red" }}>{erro}</p>
        )}

        {mensagem && (
          <p style={{ color: "green" }}>{mensagem}</p>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Cadastrar senha"}
        </button>

      </form>
    </div>
  );
}