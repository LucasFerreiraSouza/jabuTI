import { useEffect, useState } from "react";
import type { Aula } from "../../services/aulas.service";
import { listarAulas } from "../../services/aulas.service";

export default function AulasEstudantes() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div>
      <h1>Aulas (estudante)</h1>

      {aulas.map((aula) => (
        <div
          key={aula._id}
          style={{
            background: aula.backgroundColor || "#eee",
            color: aula.textColor || "#000",
            padding: 12,
            marginBottom: 12,
          }}
        >
          <h3>{aula.titulo}</h3>
          <p>{aula.descricao}</p>

          <button
            onClick={() => {
              alert(
                "Aqui depois você liga a tela de responder perguntas da aula"
              );
            }}
          >
            Responder exercícios
          </button>
        </div>
      ))}
    </div>
  );
}
