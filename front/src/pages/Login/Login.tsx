import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { authService } from "../../services/auth.service";

export default function Login() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [usuarioId2FA, setUsuarioId2FA] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErro(null);
    setLoading(true);

    try {
      const captchaToken = recaptchaRef.current?.getValue();

      if (!captchaToken) {
        setErro("Confirme o captcha");
        setLoading(false);
        return;
      }

      const response = await authService.login({
        email,
        senha,
        captchaToken
      });

      const data = response.data;

      // login sem 2FA
      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Login realizado com sucesso!");
        return;
      }

      // login com 2FA
      if (data.usuarioId) {
        setUsuarioId2FA(data.usuarioId);
        alert(data.mensagem || "Código enviado para o e-mail");
      }

      // limpa o captcha após tentativa
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
          <p>Usuário com 2FA. Verifique seu e-mail.</p>
        </div>
      )}
    </div>
  );
}
