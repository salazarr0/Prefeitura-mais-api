import { connection } from "../dbConnection";
import { TipoUsuario, User } from "../types/types";
export class UsuarioData {
  async pegarUsuarios() {
    try {
      // SQL: SELECT id, nome, email, papel FROM usuarios;
      const users = await connection("usuarios").select("id", "nome", "email", "papel");
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

  async pegarPerfilCompleto(id: Number) {
    try {
      const rows = await connection("usuarios")
        .where("usuarios.id", id)
        .leftJoin("denuncias", "usuarios.id", "=", "denuncias.usuario_id")
        .leftJoin("tipo_denuncia", "denuncias.tipo_denuncia_id", "=", "tipo_denuncia.id")
        .leftJoin("departamentos", "usuarios.id", "=", "departamentos.gerente_id")
        .select(
          "usuarios.id as u_id",
          "usuarios.nome as u_nome",
          "usuarios.email as u_email",
          "usuarios.papel as u_papel",
          "denuncias.id as d_id",
          "denuncias.titulo as d_titulo",
          "denuncias.descricao as d_descricao",
          "denuncias.status as d_status",
          "denuncias.endereco_denuncia as d_endereco",
          "tipo_denuncia.nome as d_tipo",
          "departamentos.id as dep_id",
          "departamentos.nome as dep_nome",
          "departamentos.endereco as dep_endereco"
        );

      if (!rows || rows.length === 0) {
        return null;
      }

      const userProfile = {
        id: rows[0].u_id,
        nome: rows[0].u_nome,
        email: rows[0].u_email,
        papel: rows[0].u_papel,
        departamento: rows[0].dep_id ? {
          id: rows[0].dep_id,
          nome: rows[0].dep_nome,
          endereco: rows[0].dep_endereco
        } : null,
        denuncias: [] as any[]
      };

      for (let row of rows) {
        if (row.d_id) {
          const exists = userProfile.denuncias.find(d => d.id === row.d_id);
          if (!exists) {
            userProfile.denuncias.push({
              id: row.d_id,
              titulo: row.d_titulo,
              descricao: row.d_descricao,
              status: row.d_status,
              endereco: row.d_endereco,
              tipo: row.d_tipo
            });
          }
        }
      }

      return userProfile;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
}