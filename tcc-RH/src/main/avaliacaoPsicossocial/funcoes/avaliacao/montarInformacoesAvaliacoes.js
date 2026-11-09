
/* --------------------------------------------------------- */
/* MONTAR INFORMAÇÕES DAS AVALIAÇÕES PSICOSSOCIAIS           */
/* --------------------------------------------------------- */

function montarInformacoesAvaliacoes(avaliacoes, participacoes) {

    // Garante que os dados recebidos sejam listas.
    const listaAvaliacoes = Array.isArray(avaliacoes) ? avaliacoes : [];
    const listaParticipacoes = Array.isArray(participacoes) ? participacoes : [];


    // ----------------------------------------------------- //
    // 1. TOTAL DE AVALIAÇÕES
    // ----------------------------------------------------- //

    const totalAvaliacoes = listaAvaliacoes.length;


    // ----------------------------------------------------- //
    // 2. AVALIAÇÕES EM ANDAMENTO
    // ----------------------------------------------------- //

    // Obtém a data atual.
    const hoje = new Date();

    // Considera apenas o dia, sem comparar horas.
    hoje.setHours(0, 0, 0, 0);

    // Conta as avaliações que estão dentro do período.
    const avaliacoesEmAndamento = listaAvaliacoes.filter((avaliacao) => {

        // Verifica se as datas existem.
        if (!avaliacao.data_inicio || !avaliacao.data_fim) {
            return false;
        }

        // Converte as datas recebidas pela API.
        const dataInicio = new Date(avaliacao.data_inicio);
        const dataFim = new Date(avaliacao.data_fim);

        // Considera apenas o dia.
        dataInicio.setHours(0, 0, 0, 0);
        dataFim.setHours(0, 0, 0, 0);

        // Verifica se a data atual está dentro do período.
        return hoje >= dataInicio && hoje <= dataFim;

    }).length;


    // ----------------------------------------------------- //
    // 3. PERCENTUAL DE PARTICIPAÇÃO
    // ----------------------------------------------------- //

    // Conta todas as participações registradas.
    const totalParticipacoes = listaParticipacoes.length;

    // Conta somente as participações concluídas.
    // Na API, status 1 representa participação concluída.
    const participacoesConcluidas = listaParticipacoes.filter(
        (participacao) => Number(participacao.status) === 1
    ).length;

    // Calcula o percentual de participação.
    let percentualParticipacao = 0;

    if (totalParticipacoes > 0) {

        percentualParticipacao = Math.round(
            (participacoesConcluidas / totalParticipacoes) * 100
        );

    }


    // ----------------------------------------------------- //
    // RETORNO DAS INFORMAÇÕES
    // ----------------------------------------------------- //

    return {
        totalAvaliacoes,
        avaliacoesEmAndamento,
        percentualParticipacao,
        totalParticipacoes,
        participacoesConcluidas
    };

}


// Exporta a função para utilização na tela principal.
export default montarInformacoesAvaliacoes;
