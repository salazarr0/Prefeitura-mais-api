
import { UsuarioData } from "../data/UsuarioData";
import { TipoUsuario, User } from "../types/types";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

export class UsuarioBusiness {
  private usuarioData: UsuarioData;

  constructor(usuarioData?: UsuarioData) {
    this.usuarioData = usuarioData || new UsuarioData();
  }

  public async postarNovoUsuario(nome: string, email: string, senha: string) {
    try {
      // 1. Verifica se o e-mail já existe no banco.
      // Não podemos ter dois usuários com o mesmo e-mail.
      const emailVinculado = await this.usuarioData.pegarUsuarioPeloEmailNoBD(
        email
      );
      if (emailVinculado) {
        throw new Error("Email já vinculado em um usuário");
      } else {
        // 2. CRIPTOGRAFIA (Hash da senha)
        // O número '10' é o "custo" ou "salt rounds". Quanto maior, mais seguro, mas mais lento.
        // NUNCA salvamos a senha pura (plain text) no banco.
        const senhaHash = await bcrypt.hash(senha, 10);
        // 3. Define o papel padrão.
        // Todo mundo que se cadastra sozinho começa como 'cidadao'.
        // (Para criar um admin ou funcionário, provavelmente seria direto no banco ou outra rota).
        const tipo: TipoUsuario = "cidadao";
        // 4. Salva no banco enviando o HASH, não a senha original.
        const newUser = await this.usuarioData.criarUsuarioNoBancoDeDados(
          nome,
          email,
          senhaHash,
          tipo
        );
        return newUser;
      }
    } catch (error: any) {
      throw new Error(error.message || "Erro inesperado");
    }
  }

  public async login(email: string, senha: string) {
    try {
      // 1. Busca o usuário pelo e-mail
      const emailVinculado = await this.usuarioData.pegarUsuarioPeloEmailNoBD(
        email
      );
      if (emailVinculado) {
        // 2. COMPARAÇÃO DE HASH
        // A função 'compare' pega a senha que o usuário digitou agora (ex: "123456"),
        // faz o hash dela e compara com o hash que está salvo no banco.
        // Se baterem, a senha está correta.
        const senhaValida = await bcrypt.compare(
          senha,
          emailVinculado.senha_hash
        );
        if (senhaValida) {
          // 3. Preparação do TOKEN (Payload)
          // Aqui decidimos o que vai escrito "dentro" do token.
          // Colocamos o ID e o Papel (admin/cidadao) para o front-end saber o que mostrar.
          const payload = {
            id: emailVinculado.id,
            papel: emailVinculado.papel,
          };
          // 4. Pega a assinatura secreta do arquivo .env
          // Isso garante que ninguém falsifique o token.
          const chaveSecreta = process.env.JWT_KEY as string;
          // 5. Gera o Token final assinado
          const token = jsonwebtoken.sign(payload, chaveSecreta);

          return token;
        } else {
          // Senha errada
          throw new Error("Senha inválida!");
        }
      } else {
        // E-mail não encontrado
        throw new Error("Email não existe! Por favor crie uma nova conta.");
      }
    } catch (error: any) {
      throw new Error(error.message || "Erro inesperado");
    }
  }
}