import express from "express";
import { DenunciaController } from "../controller/DenunciaController";
// Importa os guardiões de segurança que analisamos antes
import { checkLogin, checkAdmin } from "../middlewares/auth";

// Cria um "mini-aplicativo" de rotas isolado.
// Isso permite que no arquivo principal (index.ts/app.ts) você faça: app.use("/denuncias", denunciaRouter)
export const denunciaRouter = express.Router();

// Instancia o Controller para podermos usar seus métodos.
const denunciaController= new DenunciaController();

// GET /denuncias/
// Lista todas as denúncias.
denunciaRouter.get("/", denunciaController.getDenuncia);

// GET /denuncias/estatisticas
denunciaRouter.get(
    "/estatisticas", 
    checkLogin, // 1º Barreira: Tem token válido? (Autenticação)
    checkAdmin, // 2º Barreira: É funcionário? (Autorização/RBAC)
    denunciaController.getEstatisticas);// 3º Ação: Entrega os dados sensíveis.

// GET /denuncias/estatisticas/:departamento_id
denunciaRouter.get(
    "/estatisticas/:departamento_id", 
    checkLogin, 
    checkAdmin, 
    denunciaController.getEstatisticasFuncionario);

// GET /denuncias/anonimas
// Lista denúncias sem revelar o autor.
denunciaRouter.get("/anonimas", denunciaController.getDenunciasAnonimas);

// GET /denuncias/fila
// Retorna a lista ordenada por gravidade (algoritmo de prioridade).
denunciaRouter.get("/fila", denunciaController.getFilaPrioridade);

// GET /denuncias/fila/:departamento_id
denunciaRouter.get(
    "/fila/:departamento_id", 
    checkLogin, 
    checkAdmin, 
    denunciaController.getFilaFuncionario);

// GET /denuncias/:id
// Busca uma denúncia específica pelo ID
denunciaRouter.get("/:id", denunciaController.getDenunciaPorId);

// PATCH /denuncias/:id
// Atualiza o status de uma denúncia. Requer autenticação e perfil de funcionário.
// Body: { "status": "Em análise" | "Resolvido" | "Pendente" }
denunciaRouter.patch(
  "/:id",
  checkLogin,  // 1º Barreira: Tem token válido?
  checkAdmin,  // 2º Barreira: É funcionário?
  denunciaController.atualizarStatus
);

// PATCH /denuncias/:id/prioridade
// Atualiza a prioridade de uma denúncia. Requer autenticação e perfil de funcionário.
// Body: { "prioridade": 1 | 2 | 3 }
denunciaRouter.patch(
  "/:id/prioridade",
  checkLogin,
  checkAdmin,
  denunciaController.atualizarPrioridade
);

// POST /denuncias/
denunciaRouter.post("/", denunciaController.postDenuncia);

// POST /denuncias/:id/confirmar
// O ":id" é uma variável de caminho (Path Variable).
// Ex: /denuncias/42/confirmar -> O id 42 vai para o req.params.id
denunciaRouter.post("/:id/confirmar",
     checkLogin, // Exige login, pois um "voto" precisa vir de alguém real.
     denunciaController.confirmarDenuncia);

// POST /denuncias/:id/comentarios
denunciaRouter.post("/:id/comentarios", 
    checkLogin, // Exige login para comentar (evita spam anônimo).
    denunciaController.postarComentario);



