export type TipoUsuario = 'cidadao' | 'funcionario';
export type StatusDenuncia = 'Pendente'| 'Em análise'| 'Resolvido';

export type User = {
    id: Number;
    nome: string;
    email: string;
    senha_hash: string;
    papel: TipoUsuario
};

export type Denuncia = {
    id:Number;
    titulo:string;
    descricao: string;
    endereco_denuncia: string;
    status: StatusDenuncia;
    anonimo:boolean;
    usuario_id: Number | null;
    tipo_denuncia_id: Number;
    prioridade?: Number; // campo calculado automaticamente pelo backend (quanto maior, maior prioridade)
}

export type Tipo_Denuncia = {
    id:Number;
    nome:string;
    departamento_id:Number
}

export type Departamento = {
    id:Number;
    nome:string;
    endereco:string;
    horario_funcionamento:string;
    gerente_id:Number;
}

export type Comentario = {
    id: Number;
    texto: string;
    data: Date;
    usuario_id: Number;
    denuncia_id: Number;
    tipo_usuario: TipoUsuario;
}

export type Confirmacao = {
    id: Number;
    data: Date;
    usuario_id: Number;
    denuncia_id: Number;
}

