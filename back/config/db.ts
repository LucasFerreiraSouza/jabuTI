/* Importa a biblioteca mongoose, responsável por fazer a conexão
   entre o Node.js / TypeScript e o banco de dados MongoDB */
import mongoose from "mongoose";

/* Cria uma função assíncrona chamada connectDB
   Ela será responsável por conectar a aplicação ao banco */
const connectDB = async () => {
  /* Inicia um bloco de tentativa para capturar possíveis erros */
  try {
    /* Realiza a conexão com o MongoDB usando a URL armazenada
       na variável de ambiente MONGO_URL */
    await mongoose.connect(process.env.MONGO_URL as string);

    /* Exibe uma mensagem no terminal indicando que o banco
       foi conectado com sucesso */
    console.log("🟢 Banco conectado com sucesso");
  } catch (error) {
    /* Caso ocorra algum erro na conexão, exibe a mensagem
       de erro no terminal */
    console.error("🔴 Erro ao conectar no banco", error);

    /* Encerra a aplicação imediatamente com código de erro (1),
       evitando que o servidor continue rodando sem banco */
    process.exit(1);
  }
};

/* Exporta a função connectDB para que ela possa ser utilizada
   em outros arquivos, como o server.ts */
export default connectDB;
 