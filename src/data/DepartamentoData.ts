import { connection } from "../dbConnection";
import { Departamento } from "../types/types";

export class DepartamentoData {
  async pegarDepartamentos() {
    try {
      // SQL: SELECT * FROM departamentos;
      const departamentos = await connection("departamentos").select();
      return departamentos;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
  async pegarDepartamentoPorId(id: Number): Promise<Departamento | undefined> {
    try {
      // SQL: SELECT * FROM departamentos WHERE id = ? LIMIT 1;
      const departamento: Departamento = await connection("departamentos")
        .where({ id: id }) // Filtro pelo ID
        .first(); // Retorna o objeto direto (não um array)
      return departamento;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
  async pegarDepartamentoPorNome(
    nome: string
  ): Promise<Departamento | undefined> {
    try {
      // SQL: SELECT * FROM departamentos WHERE nome = ? LIMIT 1;
      const departamento: Departamento = await connection("departamentos")
        .where({ nome: nome })
        .first();
      return departamento;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
  async criarDepartamento(
    nome: string,
    endereco: string,
    horario_funcionamento: string,
    gerente_id: Number
  ): Promise<Number> {
    try {
      // SQL: INSERT INTO departamentos (...) VALUES (...)
      const novoDepto = await connection("departamentos").insert([
        {
          nome: nome,
          endereco: endereco,
          horario_funcionamento: horario_funcionamento,
          gerente_id: gerente_id,
        },
      ]);
      // O Knex (em MySQL/SQLite) retorna um array com o ID criado na primeira posição.
      const novoId: number = novoDepto[0];
      return novoId;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
  async atualizarDepartamento(
    id: Number,
    nome: string,
    endereco: string,
    horario_funcionamento: string,
    gerente_id: Number
  ) {
    try {
      // SQL: UPDATE departamentos SET nome = ?, endereco = ? ... WHERE id = ?
      await connection("departamentos").where({ id: id }).update({
        // MUITO IMPORTANTE: O Where vem antes do Update.
        nome: nome,
        endereco: endereco,
        horario_funcionamento: horario_funcionamento,
        gerente_id: gerente_id,
      });
      // O retorno é void (vazio), pois se não deu erro, assume-se sucesso.
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
  async deletarDepartamento(id: Number) {
    try {
      // SQL: DELETE FROM departamentos WHERE id = ?
      await connection("departamentos")
        .where({ id: id }) // Filtra qual apagar
        .del(); // Executa a deleção
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
}