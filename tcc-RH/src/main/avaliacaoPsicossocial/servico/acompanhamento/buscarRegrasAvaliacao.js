
const API = 'http://localhost:8080/v1/senai/avalon';

// Busca somente as regras vinculadas à avaliação selecionada.
async function buscarRegrasAvaliacao(idAvaliacao) {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    const resposta = await fetch(`${API}/avaliacao_motor_regras`, {
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
        throw new Error('Não foi possível buscar os parâmetros da avaliação.');
    }

    const dados = await resposta.json();

    const vinculos = dados.response?.avaliacao_motor_regras
        ?? dados.avaliacao_motor_regras
        ?? [];

    // Mantém somente os vínculos da avaliação selecionada.
    const vinculosAvaliacao = vinculos.filter((vinculo) => {

        return Number(vinculo.avaliacao?.id) === Number(idAvaliacao);

    });

    // Organiza os dados para o formato utilizado pelo frontend.
    return vinculosAvaliacao
        .filter((vinculo) => vinculo.motor_regras && vinculo.fator_psicossocial)
        .map((vinculo) => {

            return {
                id: vinculo.motor_regras.id,

                id_psicossocial_fator: vinculo.fator_psicossocial.id,

                operador: vinculo.motor_regras.operador,

                valor_referencial: vinculo.motor_regras.valor_referencial,

                classificacao: vinculo.motor_regras.classificacao,

                acao: vinculo.motor_regras.acao,

                // O retorno da rota de vínculo não apresenta o campo ativo.
                // A regra vinculada será considerada disponível nesta avaliação.
                ativo: 1
            };

        });

}

export default buscarRegrasAvaliacao;
