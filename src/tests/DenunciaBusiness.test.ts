import { DenunciaBusiness } from "../business/DenunciaBusiness";
import { DenunciaDataMock } from "./mocks/DenunciaDataMock";
import { ConfirmacaoDataMock } from "./mocks/ConfirmaçãoDataMock";
import { ComentarioDataMock } from "./mocks/ComentarioDataMock";
import { UsuarioDataMock } from "./mocks/UsuarioDataMock";
import { DenunciaData } from "../data/DenunciaData";
import { ConfirmacaoData } from "../data/ConfirmacaoData";
import { ComentarioData } from "../data/ComentarioData";
import { UsuarioData } from "../data/UsuarioData";

describe("Testes da DenunciaBusiness", () => {
    const denunciaDataMock = new DenunciaDataMock();
    const confirmacaoDataMock = new ConfirmacaoDataMock();
    const comentarioDataMock = new ComentarioDataMock();
    const usuarioDataMock = new UsuarioDataMock();

    const denunciaBusiness = new DenunciaBusiness(
        denunciaDataMock as unknown as DenunciaData,
        confirmacaoDataMock as unknown as ConfirmacaoData,
        comentarioDataMock as unknown as ComentarioData,
        usuarioDataMock as unknown as UsuarioData
    );

    test("Deve calcular prioridade nivel 3 para incendio", async () => {
        const input = {
            titulo: "Fogo na mata",
            descricao: "Grande incêndio perto das casas",
            endereco_denuncia: "Rua da Mata",
            tipo_denuncia_id: 1,
            anonimo: false
        };

        const resultado = await denunciaBusiness.criarDenuncia(input, 1);

        expect(resultado.prioridade).toBe(3);
        expect(resultado.id).toBe(100);
    });

    test("Deve calcular prioridade nivel 1 para lixo (padrão)", async () => {
        const input = {
            titulo: "Lixo na calçada",
            descricao: "Sacos rasgados",
            endereco_denuncia: "Rua Limpa",
            tipo_denuncia_id: 2,
            anonimo: false
        };

        const resultado = await denunciaBusiness.criarDenuncia(input, 1);

        expect(resultado.prioridade).toBe(1);
    });

    test("Deve impedir usuário de confirmar a mesma denúncia duas vezes", async () => {
        const usuarioId = 1;
        const denunciaId = 1;

        await expect(denunciaBusiness.confirmarDenuncia(usuarioId, denunciaId))
            .rejects
            .toThrow("Usuário já confirmou esta denúncia");
    });

    test("Deve permitir confirmação se o usuário ainda não confirmou", async () => {
        const usuarioId = 2;
        const denunciaId = 1;

        const resultado = await denunciaBusiness.confirmarDenuncia(usuarioId, denunciaId);

        expect(resultado.id).toBe(1);
        expect(resultado.total_confirmacoes).toBe(5);
    });

    test("Deve falhar ao tentar confirmar denúncia inexistente", async () => {
        const usuarioId = 2;
        const denunciaId = 99;

        await expect(denunciaBusiness.confirmarDenuncia(usuarioId, denunciaId))
            .rejects
            .toThrow("Denúncia não encontrada");
    });

    test("Deve retornar lista anonimizada sem usuario_id", async () => {
        const resultado = await denunciaBusiness.pegarDenunciasAnonimas();

        expect(resultado.length).toBeGreaterThan(0);
        expect(resultado[0]).not.toHaveProperty("usuario_id");
    });

    test("Deve criar comentário com sucesso", async () => {
        const usuarioId = 2;
        const denunciaId = 1;
        const texto = "Situação complicada";

        const resultado = await denunciaBusiness.comentarDenuncia(usuarioId, denunciaId, texto);

        expect(resultado.texto).toBe(texto);
        expect(resultado.tipo_usuario).toBe("funcionario");
    });
});