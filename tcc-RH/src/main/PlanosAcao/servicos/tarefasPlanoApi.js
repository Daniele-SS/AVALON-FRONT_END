
/****************************************************************
 * Objetivo: Buscar as tarefas cadastradas dos planos de ação.
 * Observação: Este serviço realiza somente consultas.
 ****************************************************************/

const API_BASE_URL = 'http://localhost:8080/v1/senai/avalon';

//----------------- LISTAR TAREFAS -----------------------------//

async function listarTarefasPlano() {
    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${API_BASE_URL}/tarefa_plano`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    });

    // O backend retorna 404 quando ainda não existem tarefas.
    if (resposta.status === 404) {
        return [];
    }

    let dados;

    try {
        dados = await resposta.json();
    } catch {
        throw new Error('Não foi possível interpretar a resposta das tarefas.');
    }

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');

        throw new Error('Sua sessão expirou. Faça login novamente.');
    }

    if (!resposta.ok || dados.status === false) {
        throw new Error(
            dados.message || 'Não foi possível carregar as tarefas.'
        );
    }

    return dados.response?.tarefas || [];
}

//----------------- EXPORTAÇÃO ---------------------------------//

export { listarTarefasPlano };
