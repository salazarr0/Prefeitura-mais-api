export class ConfirmacaoDataMock {
    public async criarConfirmacao(usuario_id: number, denuncia_id: number): Promise<number> {
        return 1;
    }

    public async existeConfirmacao(usuario_id: number, denuncia_id: number): Promise<boolean> {
        if (usuario_id === 1 && denuncia_id === 1) {
            return true;
        }
        return false;
    }

    public async contarConfirmacoesPorDenuncia(denuncia_id: number): Promise<number> {
        return 5;
    }
}