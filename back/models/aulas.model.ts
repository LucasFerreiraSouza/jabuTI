import { Schema, model, Document, Types } from 'mongoose';

/* =============================
   Subdocumento de Resposta de Exercício
============================= */
const RespostaSchema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    correta: { type: Boolean, required: true },
    dataResposta: { type: Date, default: Date.now },
    tempoSegundos: { type: Number, default: 0 } // tempo que o aluno levou para responder
  },
  { _id: true }
);

/* =============================
   Subdocumento de Pergunta de Exercício
============================= */
const ExercicioSchema = new Schema(
  {
    pergunta: { type: String, required: true },
    alternativas: [{ type: String, required: true }],
    respostaCorreta: { type: Number, required: true }, // índice da alternativa correta
    acertos: { type: Number, default: 0 }, // total de acertos de todos os usuários
    erros: { type: Number, default: 0 },   // total de erros de todos os usuários
    tempoLimiteSegundos: { type: Number, default: 0 }, // 0 = sem limite
    respostas: [RespostaSchema] // array de respostas individuais
  },
  { _id: true }
);

/* =============================
   Subdocumento de Conteúdo
============================= */
const ConteudoSchema = new Schema(
  {
    tipo: {
      type: String,
      enum: ["texto", "video", "codigo", "imagem", "exercicio"],
      required: true,
      default: "texto",
    },
    titulo: { type: String, maxlength: 2000 },
    descricao: { type: String, maxlength: 2000 },
    texto: { type: String },
    codigo: { type: String },
    video: { type: String },
    imagem: { url: { type: String } },
    exercicio: [ExercicioSchema], // se tipo === "exercicio"
    ordem: { type: Number, default: 0 },
    backgroundColor: { type: String, default: "#ffffff" },
    textColor: { type: String, default: "#000000" },
    criadoPor: { type: Schema.Types.ObjectId, ref: "Usuario" },
    criadoPorUsername: { type: String, maxlength: 50 },
  },
  { timestamps: true }
);

/* =============================
   Schema principal da Aula
============================= */
const AulaSchema = new Schema(
  {
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    publicada: { type: Boolean, default: false },
    ordem: { type: Number, default: 0 },
    backgroundColor: { type: String, default: "#ffffff" },
    textColor: { type: String, default: "#000000" },
    conteudos: [ConteudoSchema],
    criadoPor: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  },
  { timestamps: true }
);

/* =============================
   Schema de Configuração do Site
============================= */
const SiteConfigSchema = new Schema(
  {
    backgroundColorSite: { type: String, default: "#f0f0f0" },
    textColorSite: { type: String, default: "#000000" },
  },
  { collection: "site_config", timestamps: true }
);

/* =============================
   Models
============================= */
const Aula = model("Aula", AulaSchema);
const SiteConfig = model("SiteConfig", SiteConfigSchema);

export { Aula, SiteConfig };
