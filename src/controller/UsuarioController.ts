import { Response, Request, NextFunction } from "express";
import { UsuarioBusiness } from "../business/UsuarioBusiness";

export class UsuarioController {
  // Instancia a camada de negócio
  userBusiness = new UsuarioBusiness();
  register = async (req: Request, res: Response) => {
    try {
      // Extrai dados do corpo da requisição
      const { nome, email, senha } = req.body;
      // Validação de Entrada:
      // Se faltar qualquer um dos 3 campos, rejeita imediatamente.
      if (!nome || !email || !senha) {
        return res
          .status(400)
          .send({ error: "Um dos campos não foi inserido!" });
      } else {
        // Chama a Business para criptografar a senha e salvar no banco
        const newUser = await this.userBusiness.postarNovoUsuario(
          nome,
          email,
          senha
        );
        // Retorna 201 Created (Sucesso na criação)
        res.status(201).send(newUser);
      }
    } catch (error: any) {
      // Se a Business disse "Email já vinculado...", significa conflito.
      if (error.message.includes("Email já vinculado em um usuário")) {
        res.status(409).send({ message: error.message }); // 409 Conflict (Recurso já existe)
      } else {
        res.status(500).send(error.message);
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, senha } = req.body;
      // Valida se enviou tudo
      if (!email || !senha) {
        return res
          .status(400)
          .send({ error: "Um dos campos não foi inserido!" });
      }
      // Chama a Business. Se der certo, ela devolve o TOKEN JWT.
      const token = await this.userBusiness.login(email, senha);
      // Retorna 200 OK com o token (o "crachá" do usuário)
      res.status(200).send(token);
    } catch (error: any) {
      // 1. O e-mail não existe no banco? -> 404 Not Found
      if (
        error.message.includes(
          "Email não existe! Por favor crie uma nova conta."
        )
      ) {
        // 2. O e-mail existe, mas a senha está errada? -> 401 Unauthorized
        res.status(404).send(error.message);
      } else if (error.message.includes("Senha inválida!")) {
        res.status(401).send(error.message);
      } else {
        res.status(500).send({ message: "ERRO inesperado", error: error.message });
      }
    }
  };

  public getProfile = async (req: Request, res: Response) => {
    try {
      // Pega os dados que foram injetados na requisição pelo Middleware de Autenticação
      const userPayload = (req as any).usuario;
      // Se por algum motivo o middleware falhou e não colocou os dados lá...
      if (!userPayload) {
        return res.status(500).send({ error: "Payload não existe!" });
      }

      // Formata o 'iat' (Unix Timestamp) para uma data mais amigável e legível
      if (userPayload.iat) {
        const dataFormatada = new Date(userPayload.iat * 1000).toLocaleString('pt-BR');
        userPayload.emitidoEm = dataFormatada;
        delete userPayload.iat; // Remove o timestamp cru
      }

      // Devolve os dados do token
      res.status(200).send(userPayload);
    } catch (error: any) {
      res.status(500).send({ error: "Erro não esperado!" });
    }
  };
}