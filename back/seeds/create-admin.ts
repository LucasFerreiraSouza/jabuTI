import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Usuario from '../models/usuarios.model';

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/jabuti_db';

async function criarAdmin() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('📦 Conectado ao MongoDB');

    const adminEmail = 'jabutiadmin@yopmail.com';

    const adminExiste = await Usuario.findOne({ email: adminEmail });

    if (adminExiste) {
      console.log('❌ Admin já existe com esse email');
      process.exit(0);
    }

    const senhaHash = await bcrypt.hash('Admin@123', 10);

    await Usuario.create({
      nome: 'Administrador',
      email: adminEmail,
      senha: senhaHash,
      role: 'ADMIN',
      status: 'APROVADO',
      doisFatoresAtivo: false
    });

    console.log('✅ Admin criado com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('🔥 Erro ao criar admin:', error);
    process.exit(1);
  }
}

criarAdmin();
