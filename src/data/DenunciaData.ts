import { connection } from "../dbConnection";

export class DenunciaData {
  async pegarDenuncias() {
    try {
      // Equivalente SQL: SELECT * FROM denuncias;
      const denuncias = await connection("denuncias").select();
      return denuncias;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async contarTotalDenuncias() {
    // Equivalente SQL: SELECT COUNT(*) as total FROM denuncias;
    const result = await connection("denuncias").count("* as total");
    // O banco devolve um array [{ total: 150 }], pegamos o valor direto.
    return result[0].total;
  }

  async contarPorStatus() {
    // Equivalente SQL:
    // SELECT status, COUNT(*) as contagem
    // FROM denuncias
    // GROUP BY status;
    const result = await connection("denuncias")
      .select("status")
      .count("* as contagem")
      .groupBy("status");
    return result;
  }

  async contarPorDepartamento() {
    // Equivalente SQL:
    // SELECT departamentos.nome, COUNT(denuncias.id)
    // FROM denuncias
    // INNER JOIN tipo_denuncia ON denuncias.tipo_denuncia_id = tipo_denuncia.id
    // INNER JOIN departamentos ON tipo_denuncia.departamento_id = departamentos.id
    // GROUP BY departamentos.nome;
    const result = await connection("denuncias")
      // Join 1: Liga Denúncia com Tipo
      .join("tipo_denuncia", "denuncias.tipo_denuncia_id", "tipo_denuncia.id")
      // Join 2: Liga Tipo com Departamento
      .join(
        "departamentos",
        "tipo_denuncia.departamento_id",
        "departamentos.id"
      )
      // Seleciona o nome do departamento e conta
      .select("departamentos.nome as nome_departamento")
      .count("denuncias.id as contagem")
      // Agrupa pelo nome para somar
      .groupBy("departamentos.nome");
    return result;
  }

  async criarDenuncia(denuncia: any) {
    try {
      const inserted = await connection("denuncias").insert(
        [
          {
            titulo: denuncia.titulo,
            descricao: denuncia.descricao,
            endereco_denuncia: denuncia.endereco_denuncia,
            // Lógica de Default: Se não vier status, assume 'Pendente'.
            status: denuncia.status || "Pendente",
            // Garante que é booleano
            anonimo: denuncia.anonimo === true,
            // Lógica de Anônimo:
            // Se tiver ID de usuário, salva. Se não tiver, salva NULL no banco.
            usuario_id: denuncia.usuario_id || null,
            tipo_denuncia_id: denuncia.tipo_denuncia_id,
          },
        ],
        ["id"]
      );
      // Tratamento de retorno do ID (compatibilidade entre bancos)
      const id = (inserted[0] && (inserted[0].id || inserted[0])) || inserted;
      return id;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async pegarDenunciaPorId(id: number) {
    try {
      // Equivalente SQL: SELECT * FROM denuncias WHERE id = ? LIMIT 1;
      const denuncia = await connection("denuncias").where({ id }).first();
      return denuncia;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async atualizarStatusDenuncia(id: number, status: string) {
    try {
      // Equivalente SQL: UPDATE denuncias SET status = ? WHERE id = ?;
      const linhasAfetadas = await connection("denuncias")
        .where({ id })
        .update({ status });
      return linhasAfetadas;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
}