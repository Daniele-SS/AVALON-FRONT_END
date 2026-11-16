
const API = 'http://localhost:8080/v1/senai/avalon';

// Busca as perguntas e extrai os fatores psicossociais.
async function buscarFatoresAvaliacao() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    const resposta = await fetch(`${API}/avaliacao_pergunta`, {
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
        throw new Error('Não foi possível buscar os fatores psicossociais.');
    }

    const dados = await resposta.json();

    const perguntas = dados.response?.avaliacaoPerguntas
        ?? dados.avaliacaoPerguntas
        ?? [];

    // Extrai os fatores sem repetir seus IDs.
    const fatores = new Map();

    perguntas.forEach((pergunta) => {

        const fator = pergunta.psicossocial_fator;

        if (fator && Number(fator.ativo) === 1) {
            fatores.set(Number(fator.id), fator);
        }

    });

    return Array.from(fatores.values());

}

export default buscarFatoresAvaliacao;
