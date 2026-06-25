import { Request, Response } from "express";
import { ConfirmacaoBusiness } from "../business/ConfirmacaoBusiness";

export class ConfirmacaoController {
  private confirmacaoBusiness: ConfirmacaoBusiness;

  constructor() {
    this.confirmacaoBusiness = new ConfirmacaoBusiness();
  }

  public toggleConfirmacao = async (req: Request, res: Response): Promise<void> => {
    try {
      // Pega o denuncia_id dos params da rota /denuncias/:id/confirmar
      const denuncia_id = Number(req.params.id);
      // Pega o usuario autenticado (injetado pelo middleware checkLogin)
      const usuario = (req as any).usuario;

      if (!usuario) {
        res.status(401).send({ message: "Usuário não autenticado." });
        return;
      }

      if (isNaN(denuncia_id)) {
        res.status(400).send({ message: "ID da denúncia inválido." });
        return;
      }

      const result = await this.confirmacaoBusiness.toggleConfirmacao(usuario.id, denuncia_id);
      
      res.status(200).send(result);
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };

  public getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const denuncia_id = Number(req.params.id);
      const usuario = (req as any).usuario;

      if (isNaN(denuncia_id)) {
        res.status(400).send({ message: "ID da denúncia inválido." });
        return;
      }

      const count = await this.confirmacaoBusiness.getConfirmacoesPorDenuncia(denuncia_id);
      
      let confirmadoPeloUsuario = false;
      if (usuario) {
        confirmadoPeloUsuario = await this.confirmacaoBusiness.checkUsuarioConfirmou(usuario.id, denuncia_id);
      }

      res.status(200).send({ count, confirmadoPeloUsuario, userConfirmed: confirmadoPeloUsuario });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };
}
