import { connection } from "../dbConnection";

export class ComentarioData {
  async criarComentario(
    texto: string,
    usuario_id: number,
    denuncia_id: number,
    tipo_usuario: string
  ) {
    try {
      // 1. Comando de Inserção (INSERT INTO comentarios ...)
      // O 'connection' conecta na tabela 'comentarios'.
      const inserted = await connection("comentarios").insert(
        [
          {
            texto,
            data: new Date(),
            usuario_id,
            denuncia_id,
            tipo_usuario,
          },
        ],
        ["id"]
      ); // O segundo parâmetro ['id'] pede para o banco devolver o ID criado (comum em Postgres).

      // 2. Tratamento de Retorno do ID (Lógica de Compatibilidade)
      // Dependendo do banco (MySQL vs Postgres vs SQLite), o Knex retorna o ID de formas diferentes.
      // - MySQL retorna um array simples [1] ou objeto.
      // - Postgres retorna um array de objetos [{ id: 1 }].

      // Essa linha abaixo é uma "ginástica" para garantir que, não importa o banco,
      // você pegue o número do ID corretamente.
      const id = (inserted[0] && (inserted[0].id || inserted[0])) || inserted;
      return id;
    } catch (error: any) {
      // Se der erro de SQL (ex: tabela não existe, violação de chave estrangeira), estoura o erro.
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async pegarComentariosPorDenuncia(denuncia_id: number) {
    try {
      // Executa: SELECT * FROM comentarios WHERE denuncia_id = ?
      const rows = await connection("comentarios")
        .where({ denuncia_id }) // Filtro
        .select(); // Busca todas as colunas
      return rows; // Retorna um array com os resultados
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
}