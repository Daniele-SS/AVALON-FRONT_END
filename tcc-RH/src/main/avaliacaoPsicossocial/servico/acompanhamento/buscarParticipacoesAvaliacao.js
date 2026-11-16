
const API = 'http://localhost:8080/v1/senai/avalon';

// Busca as participações registradas no sistema.
async function buscarParticipacoesAvaliacao(idAvaliacao) {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    const resposta = await fetch(`${API}/avaliacao_participacao`, {
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
        throw new Error('Não foi possível buscar as participações da avaliação.');
    }

    const dados = await resposta.json();

    const participacoes = dados.response?.participacoes
        ?? dados.participacoes
        ?? [];

    // Mantém somente as participações da avaliação selecionada.
    return participacoes.filter((participacao) => {

        return Number(participacao.avaliacao?.id) === Number(idAvaliacao);

    });

}

export default buscarParticipacoesAvaliacao;
