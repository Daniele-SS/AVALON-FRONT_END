
/********************************************************************************
 * Objetivo: Buscar fatores psicossociais diretamente do catálogo
 *           tbl_psicossocial_fator, sem depender de avaliações cadastradas.
 ********************************************************************************/

const API = 'http://localhost:8080/v1/senai/avalon';

//----------------- BUSCAR FATORES PSICOSSOCIAIS -----------------//

async function buscarFatoresAvaliacao() {

    const token = localStorage.getItem('access_token');

    const resposta = await fetch(
        `${API}/pscicossocialFator`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && {
                    Authorization: `Bearer ${token}`
                })
            }
        }
    );

    // Verifica a resposta antes de tentar converter para JSON
    if (!resposta.ok) {
        throw new Error(
            `Não foi possível buscar os fatores psicossociais. Status: ${resposta.status}`
        );
    }

    const dados = await resposta.json();

    const fatores = dados.response?.psicossocialFatores || [];

    // Retorna somente fatores ativos para cadastrar regras
    return fatores
        .filter((fator) => Number(fator.ativo) === 1)
        .map((fator) => ({
            id: fator.id,
            nome: fator.nome,
            descricao: fator.descricao
        }));
}

export default buscarFatoresAvaliacao;
