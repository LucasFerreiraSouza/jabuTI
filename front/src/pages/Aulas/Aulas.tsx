import { useNavigate } from "react-router-dom";

export default function Aulas() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Página de aulas</h1>

      <button onClick={() => navigate("/login")}>
        Ir para login
      </button>
    </div>
  );
}
