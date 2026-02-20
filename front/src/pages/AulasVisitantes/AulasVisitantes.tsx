import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Aula } from "../../services/aulas.service";
import { listarAulas } from "../../services/aulas.service";

export default function AulasVisitantes() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await listarAulas();
        setAulas(data.filter((a) => a.publicada));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Carregando aulas...</p>;

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }}
      >
        <h1>Aulas (visitante)</h1>

        <button onClick={() => navigate("/login")}>
          Entrar
        </button>
      </div>

      {aulas.map((aula) => (
        <div
          key={aula._id}
          style={{
            background: aula.backgroundColor || "#eee",
            color: aula.textColor || "#000",
            padding: 12,
            marginBottom: 12,
            borderRadius: 6
          }}
        >
          <h3>{aula.titulo}</h3>
          <p>{aula.descricao}</p>
        </div>
      ))}
    </div>
  );
}
