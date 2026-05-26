import { Tipo_Denuncia } from "../../types/types";

export class TipoDenunciaDataMock {

    public async pegarTiposDenuncia(): Promise<Tipo_Denuncia[]> {
        return [{id: 1, nome: "Iluminação", departamento_id: 1},
                {id: 2, nome: "Buraco", departamento_id: 2}];
    }

    public async criarTipoDenuncia(nome: string, departamento_id: number): Promise<number> {
        return 3;
    }

    public async atualizarTipoDenuncia(id: number, nome: string, departamento_id: Number): Promise<void> {}

    public async deletarTipoDenuncia(id: number): Promise<void> {}

    public async TiposDenunciaPorId(departamentoId: number): Promise<any> {
    if (departamentoId === 1) {
        return [{ id: 1, nome: "Poste", departamento_id: 1 }];
    }
    return undefined; 
}

}