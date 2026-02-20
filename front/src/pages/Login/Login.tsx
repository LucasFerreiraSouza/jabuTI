// C:\Users\AGX\Desktop\jabuTI\front\src\pages\Login\Login.tsx

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { authService } from "../../services/auth.service";

/* ============================
   Helpers
============================ */

function getRoleFromToken(
  token: string
): "ADMIN" | "ESTUDANTE"| null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

/* ============================
   Component
============================ */

export default function Login() {
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [usuarioId2FA, setUsuarioId2FA] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro(null);
    setLoading(true);

    try {
      const captchaToken = recaptchaRef.current?.getValue();

      if (!captchaToken) {
        setErro("Confirme o captcha");
        return;
      }

      const response = await authService.login({
        email,
        senha,
        captchaToken
      });

      const data = response.data;

      /* ============================
         Login sem 2FA
      ============================ */
      if (data.token) {
        localStorage.setItem("token", data.token);

        const role = getRoleFromToken(data.token);

        if (role === "ADMIN") {
          navigate("/aulas-admin");
        } else {
          // ESTUDANTE
          navigate("/aulas-estudantes");
        }

        return;
      }

      /* ============================
         Login com 2FA
      ============================ */
      if (data.usuarioId) {
        setUsuarioId2FA(data.usuarioId);
        alert(data.mensagem || "Código enviado para o e-mail");
      }

      recaptchaRef.current?.reset();
    } catch (err: any) {
      setErro(err?.response?.data?.erro || "Erro ao realizar login");
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Senha</label>
          <br />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <br />

        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        />

        <br />

        {erro && <p style={{ color: "red" }}>{erro}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {usuarioId2FA && (
        <div style={{ marginTop: 20 }}>
          <p>
            Este usuário possui verificação em duas etapas.
            <br />
            Um código foi enviado para o e-mail.
          </p>

          {/*
            Aqui depois você pode criar a tela / componente
            para chamar:
            authService.confirmarCodigo(...)
          */}
        </div>
      )}
    </div>
  );
}
