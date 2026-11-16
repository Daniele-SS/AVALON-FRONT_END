
const API = 'http://localhost:8080/v1/senai/avalon';

// Busca as perguntas cadastradas na API
export async function buscarPerguntasAvaliacao() {
    try {
        const token = localStorage.getItem('access_token');

        const resposta = await fetch(`${API}/avaliacao_pergunta`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Verifica se a sessão expirou
        if (resposta.status === 401) {
            localStorage.removeItem('access_token');
            throw new Error('Sua sessão expirou. Faça login novamente.');
        }

        if (!resposta.ok) {
            throw new Error('Não foi possível buscar as perguntas da avaliação.');
        }

        const dados = await resposta.json();

        // Retorna somente as perguntas ativas
        const perguntas = dados.response?.avaliacaoPerguntas
            ?? dados.avaliacaoPerguntas
            ?? [];

        return perguntas.filter(pergunta => Number(pergunta.ativo) === 1);

    } catch (erro) {
        console.error('Erro ao buscar perguntas:', erro);
        throw erro;
    }
}
