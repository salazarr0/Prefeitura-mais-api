import { Response, Request } from "express";
import { DenunciaBusiness } from "../business/DenunciaBusiness";
import jsonwebtoken from "jsonwebtoken";

export class DenunciaController {
  // Instancia a camada de negócio para poder usar seus métodos
  denunciaBusiness = new DenunciaBusiness();

  public getEstatisticas = async (req: Request, res: Response) => {
    try {
      // Chama a Business para fazer os cálculos matemáticos
      const stats = await this.denunciaBusiness.pegarEstatisticas();
      // Responde com status 200 (OK) e o JSON das estatísticas
      res.status(200).send(stats);
    } catch (error: any) {
      // Se der erro, responde 500 (Erro no Servidor)
      res.status(500).send({ error: error.message });
    }
  };

  // Postar comentário em uma denúncia (usuário autenticado)
  public postarComentario = async (req: Request, res: Response) => {
    try {
      // Pega o usuário que o Middleware autenticou
      const usuarioPayload = (req as any).usuario;
      // Validação de Segurança: Se não tem usuário, barra aqui (401 Unauthorized)
      if (!usuarioPayload || !usuarioPayload.id) {
        return res.status(401).send({ error: "Usuário não autenticado" });
      }
      // Prepara os dados
      const usuarioId = Number(usuarioPayload.id);
      const denunciaId = Number(req.params.id); // Vem da URL: /denuncia/:id/comentario
      const { texto } = req.body; // Vem do JSON enviado

      // Validações de entrada (Input Validation)
      if (!denunciaId || isNaN(denunciaId)) {
        return res.status(400).send({ error: "Id de denúncia inválido" });
      }
      if (!texto || String(texto).trim().length === 0) {
        return res
          .status(400)
          .send({ error: "Texto do comentário é obrigatório" });
      }

      // Chama a Business
      const result = await this.denunciaBusiness.comentarDenuncia(
        usuarioId,
        denunciaId,
        String(texto)
      );
      // Retorna 201 (Created) - Sucesso na criação
      res.status(201).send(result);
    } catch (error: any) {
      // Tratamento de erro específico: Se a Business disse "não encontrada", devolve 404
      if (error.message && error.message.includes("não encontrada")) {
        return res.status(404).send({ error: error.message });
      }
      res.status(500).send({ error: error.message });
    }
  };

  public getDenuncia = async (req: Request, res: Response) => {
    try {
      const users = await this.denunciaBusiness.pegarDenuncias();
      res.status(200).send(users);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  };

  public getDenunciasAnonimas = async (req: Request, res: Response) => {
    try {
      const anonimas = await this.denunciaBusiness.pegarDenunciasAnonimas();
      res.status(200).send(anonimas);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  };

  public getDenunciaPorId = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (!id || isNaN(id)) {
        return res.status(400).send({ error: "Id de denúncia inválido" });
      }

      const denuncia = await this.denunciaBusiness.pegarDenunciaPorId(id);
      res.status(200).send(denuncia);
    } catch (error: any) {
      if (error.message && error.message.includes("não encontrada")) {
        return res.status(404).send({ error: error.message });
      }
      res.status(500).send({ error: error.message });
    }
  };

  // Retorna fila de denúncias ordenada por prioridade (maior primeiro)
  public getFilaPrioridade = async (req: Request, res: Response) => {
    try {
      const fila =
        await this.denunciaBusiness.pegarDenunciasOrdenadasPorPrioridade();
      res.status(200).send(fila);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  };

  // Criação condicional: aceita anônimos ou associar a usuário autenticado (token opcional)
  public postDenuncia = async (req: Request, res: Response) => {
    // Desestrutura o corpo da requisição
    try {
      const {
        titulo,
        descricao,
        endereco_denuncia,
        tipo_denuncia_id,
        anonimo,
      } = req.body;
      // Validação de campos obrigatórios
      if (!titulo || !descricao || !endereco_denuncia || !tipo_denuncia_id) {
        return res.status(400).send({
          error:
            "Campos obrigatórios ausentes: titulo, descricao, endereco_denuncia, tipo_denuncia_id",
        });
      }

      let usuarioId: number | null = null;
      // Olha se tem o cabeçalho "Authorization"
      const authHeader = req.headers.authorization as string | undefined;
      if (authHeader) {
        // O padrão é "Bearer <token>", então quebra no espaço e pega a segunda parte
        const parts = authHeader.split(" ");
        if (parts.length === 2) {
          const token = parts[1];
          try {
            // Tenta validar o token manualmente
            const chave = process.env.JWT_KEY as string;
            const payload: any = jsonwebtoken.verify(token, chave);
            // Se o token for válido, pega o ID do usuário
            if (payload && payload.id) usuarioId = Number(payload.id);
          } catch (err) {
            // Se o token for inválido (expirado ou falso), não trava o sistema.
            // Apenas considera como "usuário nulo" (anônimo) e segue a vida.
            usuarioId = null;
          }
        }
      }
      // Envia para a Business com o ID (se achou) ou null (se não achou/anônimo)
      const created = await this.denunciaBusiness.criarDenuncia(
        { titulo, descricao, endereco_denuncia, tipo_denuncia_id, anonimo },
        usuarioId
      );
      res.status(201).send(created);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  };

  // Atualizar status da denúncia (apenas funcionários)
  public atualizarStatus = async (req: Request, res: Response) => {
    try {
      // Exige que esteja autenticado (injetado pelo Middleware)
      const usuarioPayload = (req as any).usuario;
      if (!usuarioPayload || !usuarioPayload.id) {
        return res.status(401).send({ error: "Usuário não autenticado" });
      }

      const id = Number(req.params.id);
      if (!id || isNaN(id)) {
        return res.status(400).send({ error: "Id de denúncia inválido" });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).send({ error: "Campo 'status' é obrigatório" });
      }

      const atualizada = await this.denunciaBusiness.atualizarStatusDenuncia(id, status);
      res.status(200).send(atualizada);
    } catch (error: any) {
      if (error.message && error.message.includes("não encontrada")) {
        return res.status(404).send({ error: error.message });
      }
      if (error.message && error.message.includes("Status inválido")) {
        return res.status(400).send({ error: error.message });
      }
      res.status(500).send({ error: error.message });
    }
  };

  // Confirmar denúncia (usuário autenticado)
  public confirmarDenuncia = async (req: Request, res: Response) => {
    try {
      // Verifica autenticação (Middleare)
      const usuarioPayload = (req as any).usuario;
      if (!usuarioPayload || !usuarioPayload.id) {
        return res.status(401).send({ error: "Usuário não autenticado" });
      }

      const usuarioId = Number(usuarioPayload.id);
      const denunciaId = Number(req.params.id);
      // Valida ID
      if (!denunciaId || isNaN(denunciaId)) {
        return res.status(400).send({ error: "Id de denúncia inválido" });
      }
      // Chama Business
      const result = await this.denunciaBusiness.confirmarDenuncia(
        usuarioId,
        denunciaId
      );
      res.status(201).send(result);
    } catch (error: any) {
      // Mapeamento de Erros da Business para HTTP:

      // Se não achou a denúncia -> 404 Not Found
      if (error.message && error.message.includes("não encontrada")) {
        return res.status(404).send({ error: error.message });
      }
      // Se já confirmou antes (regra de negócio) -> 409 Conflict
      if (error.message && error.message.includes("já confirmou")) {
        return res.status(409).send({ error: error.message });
      }
      res.status(500).send({ error: error.message });
    }
  };
}