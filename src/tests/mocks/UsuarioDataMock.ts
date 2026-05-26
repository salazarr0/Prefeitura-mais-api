import { TipoUsuario, User } from "../../types/types";

export class UsuarioDataMock {
    
    
    public async pegarUsuarioPeloEmailNoBD(userEmail: string): Promise<User | undefined> {
        if (userEmail === "email@existente.com") {
            return {
                id: 1,
                nome: "Usuário Teste",
                email: "email@existente.com",
                senha_hash: "hash_falso_do_banco", 
                papel: "cidadao"
            };
        }
        return undefined;
    }

    
    public async criarUsuarioNoBancoDeDados(nome: string, email: string, senha_hash: string, papel: TipoUsuario): Promise<number> {
        return 1;
    }

    
    public async pegarUsuarioPeloIdNoBD(userId: number): Promise<User | undefined> {
        if (userId === 1) {
            return {
                id: 1,
                nome: "Usuário Teste",
                email: "email@existente.com",
                senha_hash: "hash_falso_do_banco",
                papel: "cidadao"
            };
        }else if (userId === 2) {
            return {
                id: 2,
                nome: "Cidadão Teste",
                email: "cidadao@teste.com",
                senha_hash: "hash",
                papel: "funcionario" 
            };
        }
        return undefined;
    }
}