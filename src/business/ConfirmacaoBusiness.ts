import { ConfirmacaoData } from "../data/ConfirmacaoData";

export class ConfirmacaoBusiness {
  private confirmacaoData: ConfirmacaoData;

  constructor() {
    this.confirmacaoData = new ConfirmacaoData();
  }

  public async toggleConfirmacao(usuario_id: number, denuncia_id: number) {
    try {
      if (!usuario_id || !denuncia_id) {
        throw new Error("Dados incompletos para confirmação.");
      }

      // Check if user already confirmed
      const existe = await this.confirmacaoData.existeConfirmacao(usuario_id, denuncia_id);

      if (existe) {
        // Remove it
        await this.confirmacaoData.removerConfirmacao(usuario_id, denuncia_id);
        return { message: "Confirmação removida com sucesso.", confirmed: false };
      } else {
        // Create it
        await this.confirmacaoData.criarConfirmacao(usuario_id, denuncia_id);
        return { message: "Confirmação adicionada com sucesso.", confirmed: true };
      }
    } catch (error: any) {
      throw new Error(error.message || "Erro inesperado ao alterar confirmação");
    }
  }

  public async getConfirmacoesPorDenuncia(denuncia_id: number) {
    try {
      if (!denuncia_id) {
        throw new Error("ID da denúncia não fornecido.");
      }
      const count = await this.confirmacaoData.contarConfirmacoesPorDenuncia(denuncia_id);
      return count;
    } catch (error: any) {
      throw new Error(error.message || "Erro inesperado ao contar confirmações");
    }
  }

  public async checkUsuarioConfirmou(usuario_id: number, denuncia_id: number): Promise<boolean> {
    try {
      if (!usuario_id || !denuncia_id) return false;
      return await this.confirmacaoData.existeConfirmacao(usuario_id, denuncia_id);
    } catch (error) {
      return false;
    }
  }
}
