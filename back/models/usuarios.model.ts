/* Importa o Schema e o model do Mongoose.
   - Schema define a estrutura do documento
   - model cria o modelo que conversa com o banco */
import { Schema, model } from 'mongoose';

/* Cria o schema do usuário.
   Aqui definimos como um usuário será salvo no MongoDB */
const UsuarioSchema = new Schema(
  {
    /* Nome do usuário
       type: tipo do dado
       required: campo obrigatório */
    nome: {
      type: String,
      required: true
    },

    /* Email do usuário
       unique: garante que não existam emails duplicados */
    email: {
      type: String,
      required: true,
      unique: true
    },

    /* Senha do usuário
       Normalmente essa senha será salva criptografada */
    senha: {
      type: String,
      required: true
    },

    /* Indica se o usuário é administrador */
    admin: {
      type: Boolean,
      default: false
    }
  },
  {
    /* Adiciona automaticamente:
       createdAt → data de criação
       updatedAt → data da última atualização */
    timestamps: true
  }
);

/* Cria o model chamado "Usuario"
   Esse nome vira a collection "usuarios" no MongoDB */
const Usuario = model('Usuario', UsuarioSchema);

/* Exporta o model para ser usado nos controllers */
export default Usuario;
