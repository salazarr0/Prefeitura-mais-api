import { ComentarioData } from "../data/ComentarioData";
import { DenunciaData } from "../data/DenunciaData";

export class ComentarioBusiness {
  private comentarioData: ComentarioData;
  private denunciaData: DenunciaData;

  constructor() {
    this.comentarioData = new ComentarioData();
    this.denunciaData = new DenunciaData();
  }

  public async postarComentario(
    texto: string,
    usuario_id: number,
    denuncia_id: number,
    tipo_usuario: string
  ) {
    try {
      if (!texto || !usuario_id || !denuncia_id || !tipo_usuario) {
        throw new Error("Dados incompletos para postar comentário.");
      }

      // Validar se a denuncia existe
      const denuncia = await this.denunciaData.pegarDenunciaPorId(denuncia_id);
      if (!denuncia) {
        throw new Error("Denúncia não encontrada.");
      }

      const newId = await this.comentarioData.criarComentario(
        texto,
        usuario_id,
        denuncia_id,
        tipo_usuario
      );

      return { message: "Comentário postado com sucesso!", id: newId };
    } catch (error: any) {
      throw new Error(error.message || "Erro inesperado");
    }
  }

  public async getComentariosPorDenuncia(denuncia_id: number) {
    try {
      if (!denuncia_id) {
        throw new Error("ID da denúncia não fornecido.");
      }

      // Buscamos os comentarios base
      const comentarios = await this.comentarioData.pegarComentariosPorDenuncia(denuncia_id);

      // Como o ComentarioData só retorna as colunas base, idealmente teríamos um JOIN com usuarios
      // para pegar o nome de quem comentou. Como não queremos refatorar muito, se não tiver JOIN,
      // retornamos assim mesmo. Mas o ideal seria fazer um JOIN no Data.
      return comentarios;
    } catch (error: any) {
      throw new Error(error.message || "Erro inesperado");
    }
  }
}
