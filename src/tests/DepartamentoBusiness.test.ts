import { DepartamentoBusiness } from "../business/DepartamentoBusiness";
import { DepartamentoDataMock } from "./mocks/DepartamentoDataMock";
import { UsuarioDataMock } from "./mocks/UsuarioDataMock";
import { TipoDenunciaDataMock } from "./mocks/TipoDenunciaDataMock";
import { DepartamentoData } from "../data/DepartamentoData";
import { UsuarioData } from "../data/UsuarioData";
import { TipoDenunciaData } from "../data/TipoDenunciaData";

describe("Testes da DepartamentoBusiness", () => {
    const departamentoDataMock = new DepartamentoDataMock();
    const usuarioDataMock = new UsuarioDataMock();
    const tipoDenunciaDataMock = new TipoDenunciaDataMock();

    const departamentoBusiness = new DepartamentoBusiness(
        departamentoDataMock as unknown as DepartamentoData,
        usuarioDataMock as unknown as UsuarioData,
        tipoDenunciaDataMock as unknown as TipoDenunciaData
    );
    
    test("Deve criar departamento com sucesso (Gerente Funcionário e Nome Único)", async () => {
        const input = {
            nome: "Departamento Novo",
            endereco: "Rua Nova",
            horario: "08h-18h",
            gerenteId: 2 
        };

        const resultado = await departamentoBusiness.criarDepartamento(
            input.nome, input.endereco, input.horario, input.gerenteId
        );

        expect(resultado).toBe(1);
    });

    test("Deve falhar ao criar se o Gerente for apenas 'cidadao'", async () => {
        const input = {
            nome: "Depto Falha", 
            endereco: "Rua X", 
            horario: "08h", 
            gerenteId: 1 
        };

        await expect(departamentoBusiness.criarDepartamento(
            input.nome, input.endereco, input.horario, input.gerenteId
        )).rejects.toThrow("Gerente selecionado não tem o papel 'funcionario'");
    });

    test("Deve falhar ao criar se o nome já existe", async () => {
        const input = {
            nome: "Departamento Já Existente", 
            endereco: "Rua Y", 
            horario: "08h", 
            gerenteId: 2
        };

        await expect(departamentoBusiness.criarDepartamento(
            input.nome, input.endereco, input.horario, input.gerenteId
        )).rejects.toThrow("Departamento com este nome já existe");
    });

    test("Deve impedir deleção se houver Tipos de Denúncia vinculados", async () => {
        const idComVinculo = 1; 

        await expect(departamentoBusiness.deletarDepartamento(idComVinculo))
            .rejects
            .toThrow("Não é possível deletar. Este departamento está sendo usado por Tipos de Denúncia.");
    });

    test("Deve deletar com sucesso se NÃO houver vínculos", async () => {
        const idSemVinculo = 2;

        await expect(departamentoBusiness.deletarDepartamento(idSemVinculo))
            .resolves
            .not.toThrow();
    });

    test("Deve falhar ao deletar departamento inexistente", async () => {
        const idInexistente = 99;
       
        await expect(departamentoBusiness.deletarDepartamento(idInexistente))
            .rejects
            .toThrow("Departamento não encontrado");
    });

});