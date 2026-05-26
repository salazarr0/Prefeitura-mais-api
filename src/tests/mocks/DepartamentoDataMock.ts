import { Departamento } from "../../types/types";

export class DepartamentoDataMock {

    public async pegarDepartamentos(): Promise<Departamento[]> {
        return [
            {
                id: 1,
                nome: "Departamento Teste 1",
                endereco: "Rua Teste 1",
                horario_funcionamento: "08:00 - 18:00",
                gerente_id: 1
            },
            {
                id: 2,
                nome: "Departamento Teste 2",
                endereco: "Rua Teste 2",
                horario_funcionamento: "09:00 - 17:00",
                gerente_id: 2
            }
        ];
    }

    public async pegarDepartamentoPorId(id: Number): Promise<Departamento | undefined> {
        
        if (id === 1) {
            return {
                id: 1,
                nome: "Departamento Existente",
                endereco: "Rua Mock",
                horario_funcionamento: "08h-18h",
                gerente_id: 1
            };
        } else if (id === 2) {
            return {
                id: 2,
                nome: "Departamento Sem Vínculos",
                endereco: "Rua Livre",
                horario_funcionamento: "08h-18h",
                gerente_id: 1
            };
        }
        return undefined;
    }

    public async pegarDepartamentoPorNome(nome: string): Promise<Departamento | undefined> {
        if (nome === "Departamento Já Existente") {
            return {
                id: 1,
                nome: "Departamento Já Existente",
                endereco: "Rua Mock",
                horario_funcionamento: "08h-18h",
                gerente_id: 1
            };
        }
        return undefined;
    }

    public async criarDepartamento(nome: string, endereco: string, horario_funcionamento: string, gerente_id: Number): Promise<Number> {
        return 1; 
    }

    public async atualizarDepartamento(id: Number, nome: string, endereco: string, horario_funcionamento: string, gerente_id: Number): Promise<void> {
        
    }

    public async deletarDepartamento(id: Number): Promise<void> {
        
    }
}