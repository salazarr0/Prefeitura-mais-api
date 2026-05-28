import { DenunciaData } from "../data/DenunciaData";
import { Denuncia } from "../types/types";
import { ConfirmacaoData } from "../data/ConfirmacaoData";
import { ComentarioData } from "../data/ComentarioData";
import { UsuarioData } from "../data/UsuarioData";

type EstatisticasDenuncias = {
  // Declaração das dependências (instâncias das classes de acesso a dados)
  total_denuncias: number;
  denuncias_por_status: { status: string; contagem: number }[];
  denuncias_por_departamento: { nome_departamento: string; contagem: number }[];
};

export class DenunciaBusiness {
  private denunciaData: DenunciaData;
  private confirmacaoData: ConfirmacaoData;
  private comentarioData: ComentarioData;
  private usuarioData: UsuarioData;

  constructor(
    denunciaData?: DenunciaData,
    confirmacaoData?: ConfirmacaoData,
    comentarioData?: ComentarioData,
    usuarioData?: UsuarioData
  ) {
    // Injeção de Dependência manual.
    // Se passar uma instância no construtor, usa ela (bom para testes unitários com Mocks).
    // Se não passar (uso normal), cria uma nova instância "new DenunciaData()".
    this.denunciaData = denunciaData || new DenunciaData();
    this.confirmacaoData = confirmacaoData || new ConfirmacaoData();
    this.comentarioData = comentarioData || new ComentarioData();
    this.usuarioData = usuarioData || new UsuarioData();
  }

  // Estatísticas agregadas para dashboard
  public async pegarEstatisticas(): Promise<EstatisticasDenuncias> {
    // Chama 3 métodos diferentes do banco de dados em paralelo (await sequencial aqui).
    const total = await this.denunciaData.contarTotalDenuncias();
    const porStatus = await this.denunciaData.contarPorStatus();
    const porDepartamento = await this.denunciaData.contarPorDepartamento();
    // Monta e retorna o objeto final.
    return {
      total_denuncias: Number(total),
      denuncias_por_status: porStatus.map((r: any) => ({
        status: r.status,
        contagem: Number(r.contagem),
      })),
      denuncias_por_departamento: porDepartamento.map((r: any) => ({
        nome_departamento: r.nome_departamento,
        contagem: Number(r.contagem),
      })),
    };
  }

  // calcula prioridade a partir do título/descrição
  private calcularPrioridade(denuncia: any): number {
    // Concatena Título + Descrição e joga tudo para minúsculo para facilitar a busca.
    const text = (
      (denuncia.titulo || "") +
      " " +
      (denuncia.descricao || "")
    ).toLowerCase();

    // Define arrays de palavras-chave para cada nível de gravidade.
    const nivel3 = [
      "acidente elétrico",
      "acidente eletrico",
      "choque elétrico",
      "choque eletrico",
      "eletric",
      "incêndio",
      "incendio",
      "fogo",
      "explosão",
      "explosao",
      "vítima",
      "vitima",
    ];
    const nivel2 = [
      "queda de energia",
      "apagão",
      "apagao",
      "queda energia",
      "vazamento",
      "alagamento",
      "desabamento",
    ];
    const nivel1 = [
      "lixo",
      "entulho",
      "lixo na calçada",
      "lixo na calcada",
      "calçada suja",
      "calçada suja",
      "poda de árvore",
    ];

    // Verifica se o texto contem alguma palavra do nível 3. Se sim, retorna prioridade 3.
    for (const k of nivel3) if (text.includes(k)) return 3;
    // Se não, verifica nível 2
    for (const k of nivel2) if (text.includes(k)) return 2;
    // Se não, verifica nível 1.
    for (const k of nivel1) if (text.includes(k)) return 1;

    // Se não achar nada, retorna 1 como padrão.
    return 1;
  }

  public async pegarDenuncias(): Promise<Denuncia[]> {
    try {
      // Busca os dados brutos do banco
      const denuncias = await this.denunciaData.pegarDenuncias();

      // "Enriquece" os dados. Passa em cada denúncia (map) e calcula a prioridade dela.
      const enriched = denuncias.map((d: any) => {
        const prioridade = this.calcularPrioridade(d);
        // Converte tinyint(1) do MySQL para boolean real
        return { ...d, anonimo: Boolean(d.anonimo), prioridade } as Denuncia;
      });

      return enriched;
    } catch (error: any) {
      // Tratamento de erro padrão
      throw new Error(
        "Denúncias não encontradas: " + (error.message || error.sqlMessage)
      );
    }
  }

  // retorna lista ordenada por prioridade (maior prioridade primeiro)
  public async pegarDenunciasOrdenadasPorPrioridade(): Promise<Denuncia[]> {
    const all = await this.pegarDenuncias();
    // Ordena o array. Se B for maior que A, B vem primeiro. (Decrescente: 3 -> 2 -> 1)
    return all.sort(
      (a: Denuncia, b: Denuncia) =>
        Number(b.prioridade || 0) - Number(a.prioridade || 0)
    );
  }

  // retorna denúncias sem expor quem denunciou (anonimizadas)
  public async pegarDenunciasAnonimas(): Promise<Partial<Denuncia>[]> {
    // Usa desestruturação para remover o 'usuario_id'.
    //"Pegue usuario_id e separe, coloque todo o resto na variável 'rest'".
    const all = await this.pegarDenuncias();
    // remover campos identificadores como usuario_id

    return all.map(({ usuario_id, ...rest }: any) => {
      // Retorna apenas o 'rest', ou seja, a denúncia SEM a identificação do autor.
      return rest as Partial<Denuncia>;
    });
  }

  // Busca uma denúncia específica pelo ID
  public async pegarDenunciaPorId(id: number): Promise<Denuncia> {
    try {
      const denuncia = await this.denunciaData.pegarDenunciaPorId(id);
      if (!denuncia) {
        throw new Error("Denúncia não encontrada");
      }
      
      const prioridade = this.calcularPrioridade(denuncia);
      // Converte tinyint(1) do MySQL para boolean real
      return { ...denuncia, anonimo: Boolean(denuncia.anonimo), prioridade } as Denuncia;
      
    } catch (error: any) {
      throw new Error(error.message || "Erro ao buscar denúncia");
    }
  }

  // Atualiza o status de uma denúncia (apenas funcionários)
  public async atualizarStatusDenuncia(id: number, status: string): Promise<Denuncia> {
    try {
      // Valida se o status enviado é um dos valores permitidos
      const statusPermitidos: string[] = ["Pendente", "Em análise", "Resolvido"];
      if (!statusPermitidos.includes(status)) {
        throw new Error(
          `Status inválido. Os valores permitidos são: ${statusPermitidos.join(", ")}`
        );
      }

      // Verifica se a denúncia existe antes de tentar atualizar
      const denuncia = await this.denunciaData.pegarDenunciaPorId(id);
      if (!denuncia) {
        throw new Error("Denúncia não encontrada");
      }

      // Executa a atualização no banco
      await this.denunciaData.atualizarStatusDenuncia(id, status);

      // Retorna a denúncia já com o novo status
      const atualizada = await this.denunciaData.pegarDenunciaPorId(id);
      const prioridade = this.calcularPrioridade(atualizada);
      // Converte tinyint(1) do MySQL para boolean real
      return { ...atualizada, anonimo: Boolean(atualizada.anonimo), prioridade } as Denuncia;

    } catch (error: any) {
      throw new Error(error.message || "Erro ao atualizar status da denúncia");
    }
  }

  // Confirma uma denúncia por um usuário autenticado
  public async confirmarDenuncia(usuarioId: number, denunciaId: number) {
    // 1. Validação: A denúncia existe?
    try {
      // valida existência da denúncia
      const denuncia = await this.denunciaData.pegarDenunciaPorId(denunciaId);
      if (!denuncia) {
        throw new Error("Denúncia não encontrada");
      }

      // 2. Regra de Negócio: O usuário já confirmou antes? (Não pode votar 2x)
      const jaConfirmou = await this.confirmacaoData.existeConfirmacao(
        usuarioId,
        denunciaId
      );
      if (jaConfirmou) {
        throw new Error("Usuário já confirmou esta denúncia");
      }
      // 3. Cria a confirmação no banco
      const newId = await this.confirmacaoData.criarConfirmacao(
        usuarioId,
        denunciaId
      );
      // 4. Busca o novo total para atualizar o front-end
      const totalConfirmacoes =
        await this.confirmacaoData.contarConfirmacoesPorDenuncia(denunciaId);

      return {
        id: newId,
        denuncia_id: denunciaId,
        usuario_id: usuarioId,
        total_confirmacoes: Number(totalConfirmacoes),
      };
    } catch (error: any) {
      throw new Error(error.message || "Erro ao confirmar denúncia");
    }
  }

  // Adiciona comentário por usuário autenticado na denúncia
  public async comentarDenuncia(
    usuarioId: number,
    denunciaId: number,
    texto: string
  ) {
    try {
      // Valida se o texto não está vazio ou só tem espaços
      if (!texto || texto.trim().length === 0) {
        throw new Error("Texto do comentário é obrigatório");
      }
      // Valida se a denúncia existe
      const denuncia = await this.denunciaData.pegarDenunciaPorId(denunciaId);
      if (!denuncia) {
        throw new Error("Denúncia não encontrada");
      }
      // Valida se o usuário existe para pegar o PAPEL dele (Cidadão, Admin, Prefeitura, etc)
      const usuario = await this.usuarioData.pegarUsuarioPeloIdNoBD(usuarioId);
      if (!usuario) {
        throw new Error("Usuário não encontrado");
      }
      const tipo_usuario = usuario.papel;

      // Salva o comentário
      const newId = await this.comentarioData.criarComentario(
        texto,
        usuarioId,
        denunciaId,
        tipo_usuario
      );

      return {
        id: newId,
        texto,
        usuario_id: usuarioId,
        denuncia_id: denunciaId,
        tipo_usuario,
        data: new Date(),
      };
    } catch (error: any) {
      throw new Error(error.message || "Erro ao adicionar comentário");
    }
  }

  public async criarDenuncia(
    denunciaInput: any,
    usuarioIdFromToken?: number | null
  ) {
    try {
      let usuario_id: number | null = null;
      let anonimo = false;
      // Lógica de Identificação:
      if (usuarioIdFromToken && Number(usuarioIdFromToken) > 0) {
        // Se veio token (usuário logado)...
        if (denunciaInput.anonimo === true) {
          // Mas ele marcou "Anônimo" no formulário -> Salva sem ID e flag anonimo = true
          usuario_id = null;
          anonimo = true;
        } else {
          // Ele quer se identificar -> Salva o ID dele
          usuario_id = Number(usuarioIdFromToken);
          anonimo = false;
        }
      } else {
        // Se não tem token, é totalmente anônimo
        usuario_id = null;
        anonimo = true;
      }

      // Monta o objeto para o banco (Status padrão: 'Pendente')
      const toInsert = {
        titulo: denunciaInput.titulo,
        descricao: denunciaInput.descricao,
        endereco_denuncia: denunciaInput.endereco_denuncia,
        tipo_denuncia_id: denunciaInput.tipo_denuncia_id,
        status: denunciaInput.status || "Pendente",
        anonimo,
        usuario_id,
      };
      // Salva no banco
      const newId = await this.denunciaData.criarDenuncia(toInsert);
      // Calcula a prioridade imediatamente para já devolver na resposta da API
      const prioridade = this.calcularPrioridade(toInsert as any);

      return { id: newId, ...toInsert, prioridade };
    } catch (error: any) {
      throw new Error(error.message || "Erro ao criar denúncia");
    }
  }
}