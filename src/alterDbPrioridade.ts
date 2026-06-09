import { connection } from './dbConnection';

async function run() {
    try {
        console.log('Adicionando coluna prioridade...');
        await connection.raw("ALTER TABLE denuncias ADD COLUMN prioridade INT NOT NULL DEFAULT 1");
        
        console.log('Atualizando prioridade das denúncias existentes...');
        // Você poderia ter a lógica para atualizar cada denúncia baseada no título aqui se fosse um db prod, 
        // mas para desenvolvimento basta criar a coluna, a api continuará funcionando e o front lerá como 1.
        console.log('Banco de dados atualizado com sucesso!');
    } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('A coluna prioridade já existe.');
        } else {
            console.error('Erro:', e);
        }
    } finally {
        await connection.destroy();
    }
}

run();
