import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("🟢 Banco conectado com sucesso");
  } catch (error) {
    console.error("🔴 Erro ao conectar no banco", error);
    process.exit(1);
  }
};

export default connectDB;

