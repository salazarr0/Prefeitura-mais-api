import { connection } from "../dbConnection";

export class ConfirmacaoData {
  async criarConfirmacao(usuario_id: number, denuncia_id: number) {
    try {
      // 1. Inserção
      // SQL equivalente: INSERT INTO confirmacoes (data, usuario_id, denuncia_id) VALUES (...)
      const inserted = await connection("confirmacoes").insert(
        [
          {
            data: new Date(), // Carimbo de tempo do momento do clique
            usuario_id,
            denuncia_id,
          },
        ],
        ["id"]
      ); // Pede o retorno do ID gerado
      // 2. Tratamento de compatibilidade de retorno de ID (igual ao ComentarioData)
      const id = (inserted[0] && (inserted[0].id || inserted[0])) || inserted;
      return id;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async existeConfirmacao(usuario_id: number, denuncia_id: number) {
    try {
      // 1. Busca Específica
      // SQL: SELECT * FROM confirmacoes WHERE usuario_id = ? AND denuncia_id = ? LIMIT 1
      const row = await connection("confirmacoes")
        .where({ usuario_id, denuncia_id })
        .first(); // O .first() retorna apenas o objeto, não um array. Se não achar, retorna undefined.

      // 2. Truque de JavaScript (!!)
      // 'row' pode ser o objeto da confirmação (se achou) ou undefined (se não achou).
      // O '!!' converte qualquer valor para um Booleano puro (true ou false).
      // Se achou -> true. Se não achou -> false.
      return !!row;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async contarConfirmacoesPorDenuncia(denuncia_id: number) {
    try {
      // 1. Função de Agregação (COUNT)
      // SQL: SELECT COUNT(*) as contagem FROM confirmacoes WHERE denuncia_id = ?
      const result = await connection("confirmacoes")
        .where({ denuncia_id })
        .count("* as contagem"); // Apelida o resultado da contagem como 'contagem'
      // O Knex retorna algo como: [ { contagem: 45 } ]
      // Então acessamos a posição 0 e a propriedade 'contagem'.
      return result[0].contagem;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
}