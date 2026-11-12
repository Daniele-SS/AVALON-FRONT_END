
//----------------- BUSCAR FATORES DA AVALIAÇÃO --------------//

async function buscarFatoresAvaliacao() {

    // Recupera o token de autenticação.
    const token = localStorage.getItem('access_token');

    // Consulta a API.
    const resposta = await fetch(
        'http://localhost:8080/v1/senai/avalon/avaliacao_fator',
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

    // Verifica se a requisição foi realizada corretamente.
    if (!resposta.ok) {
        throw new Error('Não foi possível buscar os fatores psicossociais.');
    }

    const dados = await resposta.json();

    // Recupera os fatores retornados pela API.
    const avaliacaoFatores = dados.response?.avaliacaoFatores || [];

    // Remove fatores duplicados e mantém somente os ativos.
    const fatoresUnicos = [];

    avaliacaoFatores.forEach((item) => {

        const fator = item.psicossocial_fator;

        if (!fator || Number(fator.ativo) !== 1) {
            return;
        }

        // Verifica se o fator já foi adicionado.
        const jaExiste = fatoresUnicos.some(
            (fatorExistente) => fatorExistente.id === fator.id
        );

        if (!jaExiste) {
            fatoresUnicos.push({
                id: fator.id,
                nome: fator.nome,
                descricao: fator.descricao
            });
        }

    });

    return fatoresUnicos;

}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarFatoresAvaliacao;
