
const API = 'http://localhost:8080/v1/senai/avalon';

// Busca as respostas registradas no sistema.
async function buscarRespostasAvaliacao(idAvaliacao) {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    const resposta = await fetch(`${API}/avaliacao_resposta`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua sessão expirou. Faça login novamente.');
    }

    if (!resposta.ok) {
        throw new Error('Não foi possível buscar as respostas da avaliação.');
    }

    const dados = await resposta.json();

    const respostas = dados.response?.respostas
        ?? dados.respostas
        ?? [];

    // Mantém somente as respostas da avaliação selecionada.
    return respostas.filter((item) => {

        return Number(item.id_avaliacao) === Number(idAvaliacao);

    });

}

export default buscarRespostasAvaliacao;
