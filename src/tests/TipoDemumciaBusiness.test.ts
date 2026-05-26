import { TipoDenunciaBusiness } from "../business/TipoDenunciaBusiness";
import { TipoDenunciaData } from "../data/TipoDenunciaData";
import { TipoDenunciaDataMock } from "./mocks/TipoDenunciaDataMock";


describe("Testes da TipoDenunciaBusiness", () => {
    
    
    const mockData = new TipoDenunciaDataMock() as unknown as TipoDenunciaData;
    
    const tipoDenunciaBusiness = new TipoDenunciaBusiness(mockData);

    
    test("Deve criar um tipo de denúncia com sucesso quando o nome não existe", async () => {
        const nome = "Enchente"; // Nome no Mock
        const departamentoId = 1;

        const resultado = await tipoDenunciaBusiness.criarTipoDenuncia(nome, departamentoId);

       
        expect(resultado).toBe(3);
    });

    
    test("Deve retornar erro quando tentar criar um tipo com nome duplicado", async () => {
        const nome = "Iluminação"; // Nome no Mock
        const departamentoId = 1;

       
        await expect(tipoDenunciaBusiness.criarTipoDenuncia(nome, departamentoId))
            .rejects
            .toThrow("Tipo Denúncia já existente com esse nome!");
    });

    
    test("Deve retornar erro se nome estiver vazio", async () => {
        await expect(tipoDenunciaBusiness.criarTipoDenuncia("", 1))
            .rejects
            .toThrow("O nome do tipo de denúncia é obrigatório.");
    });

    //teste atualizar

    test("Atualiza o tipo denuncia", async () =>{
        const id = 1;
        const nome = 'Iluminação Predial';
        const departamentoID = 1;
    
        const resultado = await tipoDenunciaBusiness.atualizarTipoDenuncia(id,nome, departamentoID);
        expect(resultado)
    });

    test ("Deve retornar erro quando tenta atualizar com um ID que não é númerico",  async ()=> {
        const id = Number("sss")
        await expect(tipoDenunciaBusiness.atualizarTipoDenuncia(id, "Iluminação Predial", 2))
            .rejects
            .toThrow("ID inválido");
    })

    test ("Deve retornar um erro se o novo nome e o ID do departamento ou se um deles não forem inseridos", async () =>{
        await expect(tipoDenunciaBusiness.atualizarTipoDenuncia(1,"",2))
            .rejects
            .toThrow("Nome e ID do departamento são obrigatórios para atualização");
    })

    test ("Deve retornar um erro se o ID do tipo denuncia inserido estiver vinculado a nenhum tipo denúncia", async () =>{
        await expect(tipoDenunciaBusiness.atualizarTipoDenuncia(9,"Alagamento", 2))
            .rejects
            .toThrow("Tipo de denúncia não encontrado");
    })


});