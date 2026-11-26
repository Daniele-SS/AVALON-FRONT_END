/********************************************************************************
 * Objetivo:
 * Buscar respostas, participações e regras das avaliações.
 ********************************************************************************/

const URL_API = 'http://localhost:8080/v1/senai/avalon';

async function requisicaoIndicadores(endpoint) {
    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${URL_API}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                Authorization: `Bearer ${token}`
            })
        }
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua sessão expirou. Faça login novamente.');
    }

    if (!resposta.ok) {
        throw new Error(
            `Não foi possível buscar ${endpoint}. Código: ${resposta.status}`
        );
    }

    return resposta.json();
}

export async function buscarRespostasIndicadores() {
    const dados = await requisicaoIndicadores(
        '/avaliacao_resposta'
    );

    return dados.response?.respostas || [];
}

export async function buscarParticipacoesIndicadores() {
    const dados = await requisicaoIndicadores(
        '/avaliacao_participacao'
    );

    return dados.response?.participacoes || [];
}

export async function buscarRegrasIndicadores() {
    const dados = await requisicaoIndicadores(
        '/avaliacao_motor_regras'
    );

    return dados.response?.avaliacao_motor_regras || [];
}