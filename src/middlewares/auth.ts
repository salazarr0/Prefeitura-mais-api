import { Response, Request, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";

export const checkLogin = (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Busca o cabeçalho 'Authorization' na requisição HTTP.
        // O padrão é enviar assim: "Authorization: Bearer <token_aqui>"
        const authheader = req.headers.authorization;

        // 2. Se não enviou nada, barra na hora.
        if (!authheader) {
            return res.status(401).send({ error: "token não fornecido" });
        }

        // 3. Separa a string "Bearer" do token real.
        // .split(" ") quebra a frase nos espaços.
        const partes = authheader.split(" ");

        // 4. Valida se o formato está certo (tem que ter 2 partes: "Bearer" e o "Token")
        if (partes.length !== 2) {
            return res.status(401).send({ error: "token mal formado" });
        }

        // 5. Pega só a segunda parte (o token criptografado)
        const token = partes[1];
        const chaveSecreta = process.env.JWT_KEY as string;

        // 6. A MÁGICA DA CRIPTOGRAFIA (Verificação de Assinatura)
        // O método .verify() usa a chave secreta do servidor para ver se o token
        // foi gerado por nós mesmos e se não foi alterado por um hacker.
        // Se o token expirou ou é falso, ele solta um erro e cai no 'catch'.
        const payload = jsonwebtoken.verify(token, chaveSecreta);

        // 7. INJEÇÃO DE DEPENDÊNCIA (Contexto)
        // Se o token é válido, o payload (dados dentro do token: id, papel) é salvo na requisição.
        // É por causa dessa linha aqui que lá no Controller você consegue usar:
        // const usuarioPayload = (req as any).usuario;
        (req as any).usuario = payload;

        // 8. Tudo certo? Pode passar para o próximo passo (Controller).
        next();

    } catch (error: any) {
        // Se o .verify() falhar (assinatura inválida ou token expirado)
        res.status(401).send({ error: "Token inválido ou expirado" });
    }
}
export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    // 1. Pega os dados do usuário que o 'checkLogin' (que rodou antes) colocou na requisição.
    const usuarioPayLoad = (req as any).usuario;

    // Sanity Check: Se por algum milagre o checkLogin falhou em colocar o usuário, barra.
    if (!usuarioPayLoad) {
        return res.status(401).send({ error: "usuario não encontrado" });
    }
    // 2. VERIFICAÇÃO DE PAPEL (Role Check)
    // Se o papel NÃO for 'funcionario', bloqueia.

    if (usuarioPayLoad.papel !== 'funcionario') {
        // Retorna 403 Forbidden (Proibido).
        // Diferença importante: 
        // 401 = Não sei quem é você. 
        // 403 = Sei quem é você, mas você não tem autorização para isso.
        return res.status(403).send({ error: "Acesso negado. Rota restrita a funcionários." });
    }
    // 3. Se for funcionário, deixa passar.
    next();
}