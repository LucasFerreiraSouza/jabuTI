/* Importa Schema e model do Mongoose
   Schema define a estrutura do documento
   model cria a collection no MongoDB */
import { Schema, model } from 'mongoose';

/* Cria o schema de Aula
   Define como uma aula será armazenada no banco */
const AulaSchema = new Schema(
  {
    /* Título da aula */
    titulo: {
      type: String,
      required: true
    },

    /* Pequena descrição da aula
       Usada em listagens e cards */
    descricao: {
      type: String,
      required: true
    },

    /* Texto explicativo da aula
       Pode conter markdown ou HTML */
    texto: {
      type: String,
      required: true
    },

    /* URL do vídeo da aula
       Ex: YouTube, Vimeo ou vídeo hospedado */
    video: {
      type: String,
      required: true
    },

    /* Código de exemplo da aula
       Pode ser uma string grande */
    codigo: {
      type: String,
      required: true
    },

    /* Exercício proposto ao aluno */
    exercicio: {
      type: String,
      required: true
    },

    /* Imagem ilustrativa da aula
       Normalmente será uma URL do Cloudinary */
      imagem: {
        url: String
      },


    /* ID do usuário que criou a aula
       Relaciona com o admin */
    criadoPor: {
      type: Schema.Types.ObjectId, // ID único do MongoDB
      ref: 'Usuario',              // Faz referência ao model Usuario
      required: true
    },

    /* Define se a aula está visível ou não */
    publicada: {
      type: Boolean,
      default: false
    }
  },
  {
    /* Adiciona automaticamente:
       createdAt e updatedAt */
    timestamps: true
  }
);

/* Cria o model Aula
   Isso vira a collection "aulas" no MongoDB */
const Aula = model('Aula', AulaSchema);

/* Exporta o model para uso nos controllers */
export default Aula;
