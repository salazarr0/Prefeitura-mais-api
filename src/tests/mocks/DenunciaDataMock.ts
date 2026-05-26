export class DenunciaDataMock {
    public async pegarDenuncias(): Promise<any[]> {
        return [
            {
                id: 1,
                titulo: "Buraco na via",
                descricao: "Grande buraco",
                endereco_denuncia: "Rua A",
                status: "Pendente",
                usuario_id: 1,
                anonimo: false
            },
            {
                id: 2,
                titulo: "Fio solto",
                descricao: "Perigo de choque elétrico",
                endereco_denuncia: "Rua B",
                status: "Em análise",
                usuario_id: 2,
                anonimo: false
            }
        ];
    }

    public async contarTotalDenuncias(): Promise<number> {
        return 10;
    }

    public async contarPorStatus(): Promise<any[]> {
        return [{ status: "Pendente", contagem: 5 }];
    }

    public async contarPorDepartamento(): Promise<any[]> {
        return [{ nome_departamento: "Infra", contagem: 2 }];
    }

    public async criarDenuncia(denuncia: any): Promise<number> {
        return 100;
    }

    public async pegarDenunciaPorId(id: number): Promise<any> {
        if (id === 1) {
            return {
                id: 1,
                titulo: "Denúncia Existente",
                descricao: "Teste",
                usuario_id: 1,
                status: "Pendente"
            };
        }
        return undefined;
    }
}