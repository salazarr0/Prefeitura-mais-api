import { Response, Request } from "express";
import { DepartamentoBusiness } from "../business/DepartamentoBusiness";

export class DepartamentoController {
  // Instancia a camada de negócio
  departamentoBusiness = new DepartamentoBusiness();

  public pegarDepartamentos = async (req: Request, res: Response) => {
    try {
      // Busca a lista
      const output = await this.departamentoBusiness.pegarDepartamentos();
      // Retorna 200 OK com o JSON
      res.status(200).send(output);
    } catch (error: any) {
      // Erro do servidor
      res.status(500).send(error.message || "Erro inesperado");
    }
  };

  public pegarDepartamentoPorId = async (req: Request, res: Response) => {
    try {
      // Converte o ID da URL (que vem como string) para número
      const id = Number(req.params.id);
      const output = await this.departamentoBusiness.pegarDepartamentoPorId(id);
      res.status(200).send(output);
    } catch (error: any) {
      // Se a Business disse "não encontrado", o Controller responde 404 (Not Found).
      if (error.message === "Departamento não encontrado") {
        res.status(404).send(error.message);
        // Se o ID for inválido (ex: texto onde deveria ser número), responde 400 (Bad Request).
      } else if (error.message === "ID inválido") {
        res.status(400).send(error.message);
      } else {
        res.status(500).send(error.message || "Erro inesperado");
      }
    }
  };

  public pegarDepartamentoPorNome = async (req: Request, res: Response) => {
    try {
      const nome = req.params.nome;
      const output = await this.departamentoBusiness.pegarDepartamentoPorNome(
        nome
      );
      res.status(200).send(output);
    } catch (error: any) {
      // Mesma lógica de tradução de erros (404 ou 400)
      if (error.message === "Departamento não encontrado") {
        res.status(404).send(error.message);
      } else if (error.message === "Nome inválido") {
        res.status(400).send(error.message);
      } else {
        res.status(500).send(error.message || "Erro inesperado");
      }
    }
  };

  public criarDepartamento = async (req: Request, res: Response) => {
    try {
      // Desestrutura os dados do corpo (JSON) da requisição
      const { nome, endereco, horario_funcionamento, gerente_id } = req.body;
      // Validação de Entrada: Se faltar qualquer campo, nem chama a Business.
      if (!nome || !endereco || !horario_funcionamento || !gerente_id) {
        return res
          .status(400)
          .send(
            "Entrada inválida. Todos os campos (nome, endereco, horario_funcionamento, gerente_id) são obrigatórios."
          );
      }
      // Chama a Business
      const output = await this.departamentoBusiness.criarDepartamento(
        nome,
        endereco,
        horario_funcionamento,
        gerente_id
      );
      // Retorna 201 Created (Status correto para criação)
      res
        .status(201)
        .send({ message: "Departamento criado com sucesso", id: output });
    } catch (error: any) {
      // Se já existe (duplicidade), retorna 409 (Conflict).
      if (error.message.includes("Departamento com este nome já existe")) {
        res.status(409).send(error.message);
      } else if (
        // Se o problema é com o Gerente (não existe ou não é funcionário), retorna 400.
        error.message.includes("gerente") ||
        error.message.includes("Gerente")
      ) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send(error.message || "Erro inesperado");
      }
    }
  };
  public atualizarDepartamento = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id); // Quem vou atualizar?
      const { nome, endereco, horario_funcionamento, gerente_id } = req.body;
      // Valida se todos os dados novos foram enviados
      if (!nome || !endereco || !horario_funcionamento || !gerente_id) {
        return res
          .status(400)
          .send(
            "Entrada inválida. Todos os campos (nome, endereco, horario_funcionamento, gerente_id) devem ser fornecidos para atualização."
          );
      }

      await this.departamentoBusiness.atualizarDepartamento(
        id,
        nome,
        endereco,
        horario_funcionamento,
        gerente_id
      );
      res.status(200).send({ message: "Departamento atualizado com sucesso" });
    } catch (error: any) {
      // Mapeia todos os erros possíveis da Business para HTTP codes
      if (error.message === "Departamento não encontrado") {
        res.status(404).send(error.message);
      } else if (error.message === "ID inválido") {
        // IMPORTANTE: Erro de Integridade Referencial
        // Se tentar apagar um departamento que tem Tipos de Denúncia vinculados.
        res.status(400).send(error.message);
      } else if (
        error.message.includes("Departamento com este nome já existe")
      ) {
        res.status(409).send(error.message); // 409 Conflict: O estado atual do servidor (vínculos) impede a ação.
      } else if (
        error.message.includes("gerente") ||
        error.message.includes("Gerente")
      ) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send(error.message || "Erro inesperado");
      }
    }
  };
  public deletarDepartamento = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await this.departamentoBusiness.deletarDepartamento(id);
      res.status(200).send({ message: "Departamento deletado com sucesso" });
    } catch (error: any) {
      if (error.message === "Departamento não encontrado") {
        res.status(404).send(error.message);
      } else if (error.message === "ID inválido") {
        res.status(400).send(error.message);
      } else if (error.message.includes("Não é possível deletar")) {
        res.status(409).send(error.message);
      } else {
        res.status(500).send(error.message || "Erro inesperado");
      }
    }
  };
}