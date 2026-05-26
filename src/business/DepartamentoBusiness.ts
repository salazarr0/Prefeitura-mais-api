import { DepartamentoData } from "../data/DepartamentoData";
import { TipoDenunciaData } from "../data/TipoDenunciaData";
import { UsuarioData } from "../data/UsuarioData";
import { Departamento } from "../types/types";

export class DepartamentoBusiness {
  // Dependências de outras classes que acessam o banco
  private departamentoData: DepartamentoData;
  private usuarioData: UsuarioData; // Necessário para verificar se o gerente existe
  private tipoDenunciaData: TipoDenunciaData; // Necessário para verificar vínculos antes de deletar

  constructor(
    departamentoData?: DepartamentoData,
    usuarioData?: UsuarioData,
    tipoDenunciaData?: TipoDenunciaData
  ) {
    // Inicializa as instâncias. Se não passar nada, cria novas.
    this.departamentoData = departamentoData || new DepartamentoData();
    this.usuarioData = usuarioData || new UsuarioData();
    this.tipoDenunciaData = tipoDenunciaData || new TipoDenunciaData();
  }

  public async pegarDepartamentos(): Promise<Departamento[]> {
    // Apenas repassa a chamada para o banco para listar tudo.
    try {
      const departamentos = await this.departamentoData.pegarDepartamentos();
      return departamentos;
    } catch (error: any) {
      throw new Error(
        error.message || "Erro inesperado ao buscar departamentos"
      );
    }
  }
  public async pegarDepartamentoPorId(id: Number): Promise<Departamento> {
    // Validação 1: O ID é um número válido?
    if (!id || typeof id !== "number" || isNaN(Number(id))) {
      throw new Error("ID inválido");
    }
    // Busca no banco
    const departamento = await this.departamentoData.pegarDepartamentoPorId(id);

    // Validação 2: Se o banco retornar null/undefined, avisa que não achou.
    if (!departamento) {
      throw new Error("Departamento não encontrado");
    }
    return departamento;
  }

  public async pegarDepartamentoPorNome(nome: string): Promise<Departamento> {
    try {
      // 1. Validação de Entrada (Input Validation):
      // Verifica se o nome está vazio, nulo ou undefined.
      // É uma proteção para não enviar consultas inúteis ao banco de dados.
      if (!nome) {
        throw new Error("Nome inválido");
      }
      // 2. Comunicação com o Banco de Dados:
      // Chama a camada 'Data' para executar o SELECT no banco.
      // O 'await' faz o código esperar a resposta do banco antes de continuar.
      const departamento = await this.departamentoData.pegarDepartamentoPorNome(
        nome
      );
      // 3. Regra de Negócio (Verificação de Existência):
      // O banco de dados retornou algo?
      // Se a variável 'departamento' for null ou undefined, significa que não achou nada.
      if (!departamento) {
        // Lança um erro para avisar o Controller que a busca falhou (404 Not Found).
        throw new Error("Departamento não encontrado");
      }
      // 4. Sucesso:
      // Se passou por todas as verificações, retorna o objeto encontrado.
      return departamento;
    } catch (error: any) {
      // 5. Tratamento de Erros:
      // Se acontecer qualquer problema (banco offline, ou os erros que lançamos acima),
      // o código cai aqui. Repassamos a mensagem de erro para o Controller.
      throw new Error(
        error.message || "Erro inesperado ao buscar departamento"
      );
    }
  }
  public async criarDepartamento(
    nome: string,
    endereco: string,
    horario_funcionamento: string,
    gerente_id: Number
  ): Promise<Number> {
    try {
      // REGRA 1: O gerente informado existe?
      // (Usa a classe UsuarioData para verificar)
      const gerente = await this.usuarioData.pegarUsuarioPeloIdNoBD(gerente_id);
      if (!gerente) {
        throw new Error("ID de gerente não encontrado");
      }
      // REGRA 2: O usuário escolhido tem permissão para ser gerente?
      // Aqui você define que apenas usuários com papel 'funcionario' podem gerenciar departamentos.
      if (gerente.papel !== "funcionario") {
        throw new Error("Gerente selecionado não tem o papel 'funcionario'");
      }
      // REGRA 3: Já existe um departamento com esse nome?
      // Evita duplicidade (ex: criar dois departamentos "Obras").
      const nomeExistente =
        await this.departamentoData.pegarDepartamentoPorNome(nome);
      if (nomeExistente) {
        throw new Error("Departamento com este nome já existe");
      }

      const novoId = await this.departamentoData.criarDepartamento(
        nome,
        endereco,
        horario_funcionamento,
        gerente_id
      );
      return novoId;
    } catch (error: any) {
      throw new Error(error.message || "Erro inesperado ao criar departamento");
    }
  }
  public async atualizarDepartamento(
    //validações de ID e existência do departamento alvo
    //validações do Gerente (se existe e se é funcionário)
    id: Number,
    nome: string,
    endereco: string,
    horario_funcionamento: string,
    gerente_id: Number
  ): Promise<void> {
    try {
      if (!id || typeof id !== "number" || isNaN(Number(id))) {
        throw new Error("ID inválido");
      }
      const deptoExiste = await this.departamentoData.pegarDepartamentoPorId(
        id
      );
      if (!deptoExiste) {
        throw new Error("Departamento não encontrado");
      }
      const gerente = await this.usuarioData.pegarUsuarioPeloIdNoBD(gerente_id);
      if (!gerente) {
        throw new Error("ID de gerente não encontrado");
      }
      if (gerente.papel !== "funcionario") {
        throw new Error("Gerente selecionado não tem o papel 'funcionario'");
      }
      const nomeExistente =
        await this.departamentoData.pegarDepartamentoPorNome(nome);
      // Se achou um departamento com esse nome, E o ID dele for DIFERENTE do que estou editando...
      // ...então é duplicidade.
      // Se o ID for igual, significa que não mudei o nome (ou mantive o mesmo), então tudo bem.
      if (nomeExistente && nomeExistente.id !== id) {
        throw new Error("Departamento com este nome já existe");
      }

      await this.departamentoData.atualizarDepartamento(
        id,
        nome,
        endereco,
        horario_funcionamento,
        gerente_id
      );
    } catch (error: any) {
      throw new Error(
        error.message || "Erro inesperado ao atualizar departamento"
      );
    }
  }
  public async deletarDepartamento(id: Number): Promise<void> {
    // Valida se o ID é número e se o departamento existe...
    try {
      if (!id || typeof id !== "number" || isNaN(Number(id))) {
        throw new Error("ID inválido");
      }
      const deptoExiste = await this.departamentoData.pegarDepartamentoPorId(
        id
      );
      if (!deptoExiste) {
        throw new Error("Departamento não encontrado");
      }

      // REGRA DE INTEGRIDADE REFERENCIAL:
      // Antes de apagar o departamento, verifica se existem "Tipos de Denúncia" ligados a ele.
      // Exemplo: Se "Buraco na rua" pertence a "Obras", eu NÃO posso apagar "Obras".
      // Se eu apagasse, as denúncias ficariam sem dono no sistema.
      const tiposVinculados = await this.tipoDenunciaData.TiposDenunciaPorId(
        id
      );
      if (tiposVinculados && tiposVinculados.length > 0) {
        throw new Error(
          "Não é possível deletar. Este departamento está sendo usado por Tipos de Denúncia."
        );
      }
      // Se não tiver vínculos, pode apagar.
      await this.departamentoData.deletarDepartamento(id);
    } catch (error: any) {
      throw new Error(
        error.message || "Erro inesperado ao deletar departamento"
      );
    }
  }
}
