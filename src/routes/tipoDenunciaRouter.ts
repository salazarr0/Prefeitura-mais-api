import express from 'express';
import * as authMiddleware from '../middlewares/auth';
import { TipoDenunciaController } from '../controller/TipoDenunciaController';

// Cria o roteador isolado
export const tipoDenunciaRouter = express.Router();

// Instancia o Controller
const tipoDenunciaController = new TipoDenunciaController;

// GET /tipo-denuncias/
// Lista todas as categorias disponíveis.
tipoDenunciaRouter.get("/", tipoDenunciaController.pegarTipoDenuncia);

// GET /tipo-denuncias/:id
// Busca uma categoria específica pelo ID.
tipoDenunciaRouter.get("/:id", tipoDenunciaController.pegarTipoDenunciaPorId);

tipoDenunciaRouter.post("/",
    authMiddleware.checkLogin,// 1. Verifica Token (Autenticação)
    authMiddleware.checkAdmin,// 2. Verifica Papel 'funcionario' (Autorização)
    tipoDenunciaController.criarTipoDenuncia);// 3. Executa

tipoDenunciaRouter.put(
    "/:id", 
    authMiddleware.checkLogin, 
    authMiddleware.checkAdmin, 
    tipoDenunciaController.atualizarTipoDenuncia
);

tipoDenunciaRouter.delete(
    "/:id",
    authMiddleware.checkLogin,
    authMiddleware.checkAdmin,
    tipoDenunciaController.deletarTipoDenuncia
);

