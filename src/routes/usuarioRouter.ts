import express from "express";
import { UsuarioController } from "../controller/UsuarioController";
// Importa o middleware de segurança (checkLogin)
import * as authMiddleware from '../middlewares/auth';


// Instancia o controlador que tem a lógica de login/registro
export const usuarioRouter = express.Router();

const usuarioController = new UsuarioController();

// POST /usuarios/
usuarioRouter.post("/", usuarioController.register);

// POST /usuarios/login
usuarioRouter.post("/login", usuarioController.login);

// GET /usuarios/me
usuarioRouter.get("/me", authMiddleware.checkLogin,// BARREIRA DE SEGURANÇA
    usuarioController.getProfile);
