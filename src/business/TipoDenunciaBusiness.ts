import { TipoDenunciaData } from "../data/TipoDenunciaData";
import { Tipo_Denuncia } from "../types/types";

export class TipoDenunciaBusiness {
  // Instância da classe que fala com o banco
  private TipoDenunciaData: TipoDenunciaData;

  constructor(tipoDenuncaData?: TipoDenunciaData) {
    // Injeção de dependência: ou usa a que foi passada ou cria uma nova.
    this.TipoDenunciaData = tipoDenuncaData || new TipoDenunciaData();
  }

  async pegarTipoDenuncia(): Promise<Tipo_Denuncia[]> {
    try {
      // Pede ao Data Layer todos os tipos cadastrados
      const tipoDenuncia: Tipo_Denuncia[] =
        await this.TipoDenunciaData.pegarTiposDenuncia();
      return tipoDenuncia;
    } catch {
      // Se der erro, lança uma mensagem genérica
      throw new Error("Erro inesperado");
    }
  }

  async pegarTipoDenunciaPorId(id: number): Promise<Tipo_Denuncia[]> {
    try {
      // Busca no banco pelo ID
      const tipoDenuncia: Tipo_Denuncia[] =
        // Validação importante:
        // O banco provavelmente retorna um array (lista). Se a lista estiver vazia (tamanho 0),
        // significa que aquele ID não existe.
        await this.TipoDenunciaData.TiposDenunciaPorId(id);
      if (tipoDenuncia.length === 0) {
        // Repassa a mensagem de erro original ou uma padrão
        throw new Error("Denúncia não encontrada");
      } else {
        return tipoDenuncia;
      }
    } catch (error: any) {
      throw new Error(
        error.message || "Erro inesperado ao encontrar o tipo denuncia"
      );
    }
  }

  async criarTipoDenuncia(
    nome: string,
    departamento_id: number
  ): Promise<number> {
    try {
      // 1. Validação básica: tem nome?
      if (!nome) {
        throw new Error("O nome do tipo de denúncia é obrigatório.");
      }
      // 2. Busca TODOS os tipos já existentes no banco para comparar na memória
      const tiposExistentes: Tipo_Denuncia[] =
        await this.TipoDenunciaData.pegarTiposDenuncia();
      // 3. Regra de Duplicidade (Atenção aqui!)
      const duplicado = tiposExistentes.find((tipoNoBanco) => {
        // Pega a PRIMEIRA palavra do nome que está no banco.
        // Ex: Se no banco tem "Lixo na calçada", ele pega só "lixo".
        const nomeTipoDenuncia = tipoNoBanco.nome.toLowerCase().split(" ")[0];
        // Pega a PRIMEIRA palavra do nome que está tentando criar.
        // Ex: Se o usuário mandou "Lixo hospitalar", ele pega só "lixo".
        const reqNome = nome.toLowerCase().split(" ")[0];
        // Compara apenas a primeira palavra.
        return nomeTipoDenuncia === reqNome;
      });
      // Se as primeiras palavras forem iguais, ele bloqueia.
      if (duplicado) {
        throw new Error("Tipo Denúncia já existente com esse nome!");
      }
      // Se passou, cria no banco.
      const novoId = Number(
        await this.TipoDenunciaData.criarTipoDenuncia(nome, departamento_id)
      );

      return novoId;
    } catch (error: any) {
      throw new Error(
        error.message || "Erro inesperado ao criar o tipo denuncia!"
      );
    }
  }

  async atualizarTipoDenuncia(
    id: number,
    nome: string,
    departamento_id: number
  ): Promise<void> {
    try {
        // 1. Valida se o ID é um número
      if (isNaN(id)) {
        throw new Error("ID inválido");
      }
      // 2. Valida se os campos obrigatórios foram preenchidos
      if (!nome || !departamento_id) {
        throw new Error(
          "Nome e ID do departamento são obrigatórios para atualização"
        );
      }
      // 3. Verifica se o registro existe antes de tentar atualizar
      const existe = await this.TipoDenunciaData.TiposDenunciaPorId(id);
      if (!existe) {
        throw new Error("Tipo de denúncia não encontrado");
      }
      // 4. Manda atualizar
      await this.TipoDenunciaData.atualizarTipoDenuncia(
        id,
        nome,
        departamento_id
      );
    } catch (error: any) {
      throw new Error(error.message || "Erro ao atualizar tipo de denúncia");
    }
  }

  async deletarTipoDenuncia(id: number): Promise<void> {
    try {
        // Validações de entrada
      if (isNaN(id)) {
        throw new Error("ID inválido");
      }
      if (!id) {
        throw new Error("ID do tipo denuncia e obrigatório para deletar");
      }
      // Verifica se existe antes de apagar
      const existe = await this.TipoDenunciaData.TiposDenunciaPorId(id);
      if (!existe) {
        throw new Error("Tipo de denúncia não encontrado");
      }
      // Executa a deleção
      await this.TipoDenunciaData.deletarTipoDenuncia(id);
    } catch (error: any) {
      throw new Error(error.message || "Erro ao deletar tipo de denúncia");
    }
  }
}