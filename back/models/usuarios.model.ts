import { Schema, model, Document } from 'mongoose';

interface IUsuario extends Document {
  nome: string;
  email: string;
  senha?: string | null;
  role: 'ESTUDANTE' | 'ADMIN';
  status: 'PENDENTE' | 'APROVADO' | 'REPROVADO';

  avatar?: {
    url: string;
  };

  doisFatoresAtivo: boolean;

  codigo2FA?: string;
  codigo2FAExpira?: Date;
  tentativas2FA: number;

  tentativasLogin: number;
  bloqueioLoginExpira?: Date;
  bloqueio2FAExpira?: Date;

  tokenAtivacaoSenha?: string;
  tokenAtivacaoExpira?: Date;

  tokenResetSenha?: string | null;
  resetSenhaExpira?: Date | null;

  tokenResetEmail?: string | null;
  resetEmailExpira?: Date | null;

  novoEmail?: string | null;

  ultimoLogin?: Date;
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    nome: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    senha: {
      type: String,
      select: false
    },

    role: {
      type: String,
      enum: ['ESTUDANTE', 'ADMIN'],
      default: 'ESTUDANTE',
      index: true
    },

    status: {
      type: String,
      enum: ['PENDENTE', 'APROVADO', 'REPROVADO'],
      default: 'PENDENTE',
      index: true
    },

    avatar: {
      url: { type: String },
      public_id: { type: String }
    },

    doisFatoresAtivo: {
      type: Boolean,
      default: false
    },

    codigo2FA: {
      type: String,
      select: false
    },

    codigo2FAExpira: {
      type: Date,
      select: false
    },

    tentativas2FA: {
      type: Number,
      default: 0,
      select: false
    },

    tentativasLogin: {
      type: Number,
      default: 0,
      select: false
    },

    bloqueioLoginExpira: {
      type: Date,
      select: false
    },

    bloqueio2FAExpira: {
      type: Date,
      select: false
    },

    tokenAtivacaoSenha: {
      type: String,
      select: false
    },

    tokenAtivacaoExpira: {
      type: Date,
      select: false
    },

    tokenResetSenha: {
      type: String,
      select: false
    },

    resetSenhaExpira: {
      type: Date,
      select: false
    },

    tokenResetEmail: {
      type: String,
      select: false
    },

    resetEmailExpira: {
      type: Date,
      select: false
    },

    novoEmail: {
      type: String,
      select: false
    },

    ultimoLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default model<IUsuario>('Usuario', UsuarioSchema);
