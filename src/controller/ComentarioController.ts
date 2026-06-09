import { Request, Response } from "express";
import { ComentarioBusiness } from "../business/ComentarioBusiness";

export class ComentarioController {
  private comentarioBusiness: ComentarioBusiness;

  constructor() {
    this.comentarioBusiness = new ComentarioBusiness();
  }

  public postarComentario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { texto } = req.body;
      const denuncia_id = Number(req.params.id);
      
      const usuario = (req as any).usuario;
      if (!usuario) {
        res.status(401).send({ message: "Usuário não autenticado." });
        return;
      }

      if (isNaN(denuncia_id)) {
        res.status(400).send({ message: "ID da denúncia inválido." });
        return;
      }

      const result = await this.comentarioBusiness.postarComentario(
        texto,
        usuario.id,
        denuncia_id,
        usuario.papel
      );

      res.status(201).send(result);
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };

  public getComentarios = async (req: Request, res: Response): Promise<void> => {
    try {
      const denuncia_id = Number(req.params.id);
      
      if (isNaN(denuncia_id)) {
        res.status(400).send({ message: "ID da denúncia inválido." });
        return;
      }

      const comentarios = await this.comentarioBusiness.getComentariosPorDenuncia(denuncia_id);
      res.status(200).send(comentarios);
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  };
}
