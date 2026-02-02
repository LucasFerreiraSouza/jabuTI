import { Schema, model, Document } from 'mongoose';

export interface ISistemaConfig extends Document {
  aprovacaoAutomaticaUsuarios: boolean;
}

const SistemaConfigSchema = new Schema<ISistemaConfig>(
  {
    aprovacaoAutomaticaUsuarios: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default model<ISistemaConfig>(
  'SistemaConfig',
  SistemaConfigSchema
);
