export class ComentarioDataMock {
    public async criarComentario(texto: string, usuario_id: number, denuncia_id: number, tipo_usuario: string): Promise<number> {
        return 50;
    }
    
    public async pegarComentariosPorDenuncia(denuncia_id: number): Promise<any[]> {
        return [];
    }
}