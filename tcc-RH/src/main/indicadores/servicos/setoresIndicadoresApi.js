
/********************************************************************************
 * Objetivo: Buscar os setores cadastrados na API.
 ********************************************************************************/

const URL_API = 'http://localhost:8080/v1/senai/avalon';

export async function buscarSetoresIndicadores() {
    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${URL_API}/setor`, {
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
        throw new Error('Não foi possível buscar os setores.');
    }

    const dados = await resposta.json();

    return dados.response?.setor || [];
}
