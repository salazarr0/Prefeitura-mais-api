import { TipoDenunciaBusiness } from "../business/TipoDenunciaBusiness";
import { Tipo_Denuncia } from "../types/types";
import { Request, Response } from "express";

export class TipoDenunciaController {
  // Instancia a lógica de negócio

  // PEGAR TUDO (GET)
  tipoDenunciaBusiness = new TipoDenunciaBusiness();
  public pegarTipoDenuncia = async (req: Request, res: Response) => {
    try {
      // Vai no banco e busca tudo
      const pegarTipoDenuncia: Tipo_Denuncia[] =
        await this.tipoDenunciaBusiness.pegarTipoDenuncia();
      // Retorna 200 OK
      res.status(200).send(pegarTipoDenuncia);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  };

  public pegarTipoDenunciaPorId = async (req: Request, res: Response) => {
    try {
      // Tenta converter o parâmetro da URL para número
      const id = Number(req.params.id);
      // VALIDAÇÃO DE ENTRADA (Input Validation):
      // Se o usuário mandou "abc" em vez de número, barra aqui para economizar processamento.
      if (isNaN(id)) {
        res
          .status(400)
          .send({ message: "O id fornecido não um número válido" });
      } else {
        // Se for número, chama a Business
        const pegarTipoDenunciaPorId: Tipo_Denuncia[] =
          await this.tipoDenunciaBusiness.pegarTipoDenunciaPorId(id);
        res.status(200).send(pegarTipoDenunciaPorId);
      }
    } catch (error: any) {
      // Tratamento de erro específico
      if (error.message.includes("Denúncia não encontrada")) {
        res.status(404).send(error.message);
      } else {
        res.status(500).send(error.message);
      }
    }
  };

  public criarTipoDenuncia = async (req: Request, res: Response) => {
    try {
      const nome = req.body.nome;
      const departamento_id = Number(req.body.departamento_id);
      // Validação de campos obrigatórios
      if (!nome || !departamento_id || departamento_id === undefined) {
        return res
          .status(400)
          .send({ message: "Nome e ID do departamento são obrigatórios." });
      }
      // Validação se o ID do departamento é número
      if (isNaN(departamento_id)) {
        return res.status(400).send({
          message: "O ID de departamento fornecido não é um número válido.",
        });
      } else {
        // Chama a Business
        const criarTipoDenuncia =
          await this.tipoDenunciaBusiness.criarTipoDenuncia(
            nome,
            departamento_id
          );
        const resultado = criarTipoDenuncia;
        // Retorna 201 Created
        res.status(201).send({ ID: resultado });
      }
    } catch (error: any) {
      // Log para o desenvolvedor ver no terminal (importante para debug)
      console.error("Erro no Controller (criarTipoDenuncia):", error.message);
      // MAPEAMENTO DO ERRO DE NEGÓCIO:
      // A Business lançou "Tipo Denúncia já existente..."?
      // Se sim, retornamos 409 CONFLICT.
      if (error.message.includes("Tipo Denúncia já existente")) {
        return res.status(409).send({ message: error.message });
      } else {
        return res.status(500).send({
          message: "Erro interno inesperado ao criar tipo de denúncia.",
        });
      }
    }
  };

  public atualizarTipoDenuncia = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { nome, departamento_id } = req.body;
      // Chama a atualização
      await this.tipoDenunciaBusiness.atualizarTipoDenuncia(
        id,
        nome,
        Number(departamento_id)
      );

      res
        .status(200)
        .send({ message: "Tipo de denúncia atualizado com sucesso!" });
    } catch (error: any) {
      console.error(
        "Erro no Controller (atualizarTipoDenuncia):",
        error.message
      );
      // Mapeamento de erros:
      if (error.message.includes("não encontrado")) {
        return res.status(404).send({ message: error.message }); // Não achou o ID para atualizar
      } else if (
        error.message.includes("obrigatórios") ||
        error.message.includes("inválido")
      ) {
        return res.status(400).send({ message: error.message }); // Dados ruins enviados pelo usuário
      } else {
        return res.status(500).send({ message: "Erro interno ao atualizar." });
      }
    }
  };

  public deletarTipoDenuncia = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      await this.tipoDenunciaBusiness.deletarTipoDenuncia(id);

      res
        .status(200)
        .send({ message: "Tipo de denúncia deletado com sucesso!" });
    } catch (error: any) {
      console.error("Erro no Controller (DeletarTipoDenuncia):", error.message);

      if (error.message.includes("não encontrado")) {
        return res.status(404).send({ message: error.message });
      } else if (error.message.includes("ID inválido")) {
        return res.status(400).send({ message: error.message });
      } else {
        return res.status(500).send({ message: "Erro interno ao deletar." });
      }
    }
  };
}