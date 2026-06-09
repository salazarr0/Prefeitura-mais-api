import express from "express";
import { DepartamentoController } from "../controller/DepartamentoController";
// Importa todos os exports do arquivo auth e agrupa no objeto 'authMiddleware'.
// Assim você usa authMiddleware.checkLogin, etc.
import * as authMiddleware from '../middlewares/auth';

// Cria o controller para usar a lógica dele
export const departamentoRouter = express.Router();

const departamentoController = new DepartamentoController();

// GET /departamentos/
// Lista todos (Ex: Obras, Saúde, Educação).
departamentoRouter.get("/", departamentoController.pegarDepartamentos);

// GET /departamentos/:id
// Busca detalhes de um específico pelo ID.
// O Express pega o que vier depois da barra e joga em req.params.id
departamentoRouter.get("/:id", departamentoController.pegarDepartamentoPorId);

// GET /departamentos/nome/:nome
// Busca pelo nome textual.
// Ex: /departamentos/nome/Obras
departamentoRouter.get("/nome/:nome", departamentoController.pegarDepartamentoPorNome);

departamentoRouter.post("/",
    authMiddleware.checkLogin,// 1. Você está logado?
    authMiddleware.checkSuperAdmin,// 2. Você é adm?
    departamentoController.criarDepartamento// 3. Executa a criação.
);

departamentoRouter.put("/:id",
    authMiddleware.checkLogin,
    authMiddleware.checkSuperAdmin,
    departamentoController.atualizarDepartamento
);

departamentoRouter.delete("/:id",
    authMiddleware.checkLogin,
    authMiddleware.checkSuperAdmin,
    departamentoController.deletarDepartamento
);