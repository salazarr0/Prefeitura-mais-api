import { UsuarioBusiness } from "../business/UsuarioBusiness";
import { UsuarioDataMock } from "./mocks/UsuarioDataMock";
import { UsuarioData } from "../data/UsuarioData";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

// Mockando as bibliotecas externas
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

// Tipando os mocks para o TypeScript não reclamar
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const jwtMock = jsonwebtoken as jest.Mocked<typeof jsonwebtoken>;

describe("Testes da UsuarioBusiness", () => {
    // Instancia a Business com o DataMock
    const usuarioBusiness = new UsuarioBusiness(new UsuarioDataMock() as unknown as UsuarioData);

    // ============================
    // TESTES DE CADASTRO (REGISTER)
    // ============================

    test("Deve cadastrar usuário com sucesso quando email é novo", async () => {
        const nome = "Novo User";
        const email = "novo@email.com"; // Email que o Mock não conhece
        const senha = "123";
        
        // Mock do bcrypt.hash para retornar um hash fixo
        bcryptMock.hash.mockResolvedValue("hash_gerado_pelo_bcrypt" as never);

        const resultado = await usuarioBusiness.postarNovoUsuario(nome, email, senha);

        expect(resultado).toBe(1); // O Mock retorna ID 1
        expect(bcryptMock.hash).toHaveBeenCalled(); // Verifica se o hash foi chamado
    });

    test("Deve retornar erro ao cadastrar email já existente", async () => {
        const nome = "User Duplicado";
        const email = "email@existente.com"; // Email que o Mock conhece
        const senha = "123";

        await expect(usuarioBusiness.postarNovoUsuario(nome, email, senha))
            .rejects
            .toThrow("Email já vinculado em um usuário");
    });

    // ============================
    // TESTES DE LOGIN
    // ============================

    test("Deve realizar login com sucesso (retornar token)", async () => {
        const email = "email@existente.com";
        const senha = "senha_correta";

        // Mock do bcrypt.compare retornando TRUE (senhas batem)
        bcryptMock.compare.mockResolvedValue(true as never);
        // Mock do jwt.sign retornando um token fixo
        jwtMock.sign.mockReturnValue("token_jwt_sucesso" as never);

        const result = await usuarioBusiness.login(email, senha);

        expect(result).toBe("token_jwt_sucesso");
    });

    test("Deve retornar erro de login se email não existe", async () => {
        const email = "nao@existe.com";
        const senha = "123";

        await expect(usuarioBusiness.login(email, senha))
            .rejects
            .toThrow("Email não existe! Por favor crie uma nova conta.");
    });

    test("Deve retornar erro de login se senha estiver incorreta", async () => {
        const email = "email@existente.com";
        const senha = "senha_errada";

        // Mock do bcrypt.compare retornando FALSE (senhas não batem)
        bcryptMock.compare.mockResolvedValue(false as never);

        await expect(usuarioBusiness.login(email, senha))
            .rejects
            .toThrow("Senha inválida!");
    });
});