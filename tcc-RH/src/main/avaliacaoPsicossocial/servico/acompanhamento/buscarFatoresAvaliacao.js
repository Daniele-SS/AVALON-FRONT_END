
const API = 'http://localhost:8080/v1/senai/avalon';

// Busca somente os fatores vinculados à avaliação selecionada.
async function buscarFatoresAvaliacao(idAvaliacao) {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    if (!idAvaliacao) {
        throw new Error('ID da avaliação não informado.');
    }

    const resposta = await fetch(`${API}/avaliacao_fator`, {
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
        throw new Error('Não foi possível buscar os fatores da avaliação.');
    }

    const dados = await resposta.json();

    // Recupera os vínculos retornados pela API.
    const vinculos = dados.response?.avaliacaoFatores
        ?? dados.response?.avaliacao_fatores
        ?? dados.response?.avaliacao_fator
        ?? dados.avaliacaoFatores
        ?? dados.avaliacao_fatores
        ?? dados.avaliacao_fator
        ?? [];

    // Armazena os fatores sem repetir seus IDs.
    const fatores = new Map();

    vinculos.forEach((vinculo) => {

        // Identifica a avaliação à qual o fator pertence.
        const idAvaliacaoVinculo =
            vinculo.avaliacao?.id
            ?? vinculo.id_avaliacao
            ?? vinculo.idAvaliacao;

        // Ignora vínculos de outras avaliações.
        if (Number(idAvaliacaoVinculo) !== Number(idAvaliacao)) {
            return;
        }

        // Recupera o fator psicossocial vinculado.
        const fator =
            vinculo.psicossocial_fator
            ?? vinculo.fator_psicossocial;

        // Ignora fatores inválidos ou inativos.
        if (
            !fator ||
            !fator.id ||
            Number(fator.ativo) !== 1
        ) {
            return;
        }

        fatores.set(Number(fator.id), fator);

    });

    return Array.from(fatores.values());

}

export default buscarFatoresAvaliacao;
