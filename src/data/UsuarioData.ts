import { connection } from "../dbConnection";
import { TipoUsuario, User } from "../types/types";
export class UsuarioData {
  async pegarUsuarios() {
    try {
      // SQL: SELECT * FROM usuarios;
      const users = await connection("usuarios").select();
      return users;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async criarUsuarioNoBancoDeDados(
    nome: string,
    email: string,
    senha_hash: string,
    tipo: TipoUsuario
  ): Promise<Number> {
    try {
      // SQL: INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (...)
      const user = await connection("usuarios").insert(
        [{ nome: nome, email: email, senha_hash: senha_hash, papel: tipo }],
        // O MAIS IMPORTANTE:
        // Aqui salvamos "sd87syd87asy8d7..." e NUNCA a senha "123456".
        // Quem gerou esse hash foi a UsuarioBusiness usando o bcrypt.
        ["id"] // Pede para retornar o ID gerado
      );
      // Extrai o ID do retorno
      const novoId: number = user[0].id;
      return novoId;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async pegarUsuarioPeloEmailNoBD(userEmail: string) {
    try {
        // SQL: SELECT * FROM usuarios WHERE email = ? LIMIT 1;
      const userE: User = await connection("usuarios")
        .where({ email: userEmail })
        .first(); // Retorna o objeto direto
        // Retorna o usuÃ¡rio encontrado (incluindo a senha_hash) 
        // para que a Business possa comparar a senha depois.
      return userE;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async pegarUsuarioPeloIdNoBD(userId: Number): Promise<User | undefined> {
    try {
      const user: User = await connection("usuarios")
        .where({ id: userId })
        .first();
      return user;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
}