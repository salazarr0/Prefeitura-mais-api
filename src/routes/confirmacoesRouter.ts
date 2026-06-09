import express from "express";
import { ConfirmacaoController } from "../controller/ConfirmacaoController";
import { checkLogin } from "../middlewares/auth";

export const confirmacoesRouter = express.Router();
const confirmacaoController = new ConfirmacaoController();

// A rota real será montada em /denuncias/:id/confirmar 
// Porém, é mais fácil injetar direto no app principal ou no router de denuncias.
// Vamos deixar apenas os métodos aqui. Mas como a rota depende de :id de denuncia, 
// o mais comum é injetar no denunciasRouter. Mas para modularizar, podemos montar:
// /confirmacoes/denuncia/:id

// Vamos usar POST para "dar toggle" na confirmacao
confirmacoesRouter.post(
  "/:id",
  checkLogin,
  confirmacaoController.toggleConfirmacao
);
