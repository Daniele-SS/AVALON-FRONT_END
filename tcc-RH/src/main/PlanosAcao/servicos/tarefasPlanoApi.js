
/****************************************************************
 * Objetivo: Buscar e atualizar tarefas dos planos de ação.
 ****************************************************************/

const API_BASE_URL = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAÇÃO -------------------------------//

function obterConfiguracao() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };

}


//----------------- VERIFICAR RESPOSTA -------------------------//

async function verificarResposta(resposta) {

    let dados;

    try {
        dados = await resposta.json();
    } catch {
        throw new Error(
            'Não foi possível interpretar a resposta das tarefas.'
        );
    }

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua sessão expirou. Faça login novamente.'
        );

    }

    if (!resposta.ok || dados.status === false) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível realizar a operação.'
        );
    }

    return dados;

}


//----------------- LISTAR TAREFAS -----------------------------//

async function listarTarefasPlano() {

    const resposta = await fetch(
        `${API_BASE_URL}/tarefa_plano`,
        {
            method: 'GET',
            ...obterConfiguracao()
        }
    );

    // O backend retorna 404 quando ainda não existem tarefas.
    if (resposta.status === 404) {
        return [];
    }

    const dados = await verificarResposta(resposta);

    return dados.response?.tarefas || [];

}


//----------------- ATUALIZAR TAREFA ---------------------------//

async function atualizarTarefaPlano(id, tarefa) {

    const resposta = await fetch(
        `${API_BASE_URL}/tarefa_plano/${id}`,
        {
            method: 'PUT',
            ...obterConfiguracao(),
            body: JSON.stringify(tarefa)
        }
    );

    return await verificarResposta(resposta);

}


//----------------- EXPORTAÇÃO ---------------------------------//

export {
    listarTarefasPlano,
    atualizarTarefaPlano
};
