import { connection } from "../dbConnection";
import { Tipo_Denuncia } from "../types/types";

export class TipoDenunciaData {
  async pegarTiposDenuncia(): Promise<Tipo_Denuncia[]> {
    try {
      // SQL: SELECT * FROM tipo_denuncia;
      const tipos = await connection("tipo_denuncia").select("*");
      return tipos; // Retorna um Array de objetos
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async TiposDenunciaPorId(id: number): Promise<Tipo_Denuncia[]> {
    try {
      // SQL: SELECT * FROM tipo_denuncia WHERE id = ?
      const tipos = await connection("tipo_denuncia").where({ id: id });
      return tipos;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async criarTipoDenuncia(
    nome: string,
    departamento_id: number
  ): Promise<number> {
    try {
      // SQL: INSERT INTO tipo_denuncia (nome, departamento_id) VALUES (?, ?)
      const criarTipoDenuncia = await connection("tipo_denuncia").insert({
        nome: nome,
        departamento_id: departamento_id, // Chave Estrangeira (FK)
      });
      // Pega o ID gerado (padrÃ£o de retorno array do Knex)
      const novoId = criarTipoDenuncia[0];

      return novoId;
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async atualizarTipoDenuncia(
    id: number,
    nome: string,
    departamento_id: number
  ): Promise<void> {
    try {
        // SQL: UPDATE tipo_denuncia SET nome = ?, departamento_id = ? WHERE id = ?
      await connection("tipo_denuncia")
       .where({ id: id }) // Filtro (Quem?)
       .update({ // Dados (O que?)
        nome: nome,
        departamento_id: departamento_id,
      });
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }

  async deletarTipoDenuncia(id: number): Promise<void> {
    try {
        // SQL: DELETE FROM tipo_denuncia WHERE id = ?
      await connection("tipo_denuncia").where({ id: id }).delete(); // ou .del(), funcionam igual no Knex
    } catch (error: any) {
      throw new Error(error.sqlMessage || error.message);
    }
  }
}