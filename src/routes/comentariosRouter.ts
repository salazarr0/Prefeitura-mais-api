import express from "express";
import { ComentarioController } from "../controller/ComentarioController";
import { checkLogin } from "../middlewares/auth";

export const comentariosRouter = express.Router();
const comentarioController = new ComentarioController();

// /comentarios/denuncia/:id
comentariosRouter.post(
  "/:id",
  checkLogin,
  comentarioController.postarComentario
);

comentariosRouter.get(
  "/:id",
  comentarioController.getComentarios
);
