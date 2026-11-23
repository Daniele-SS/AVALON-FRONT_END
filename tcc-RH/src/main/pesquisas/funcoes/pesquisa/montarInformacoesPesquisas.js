//----------------- INTERPRETAR SITUAÇÃO DA PESQUISA --------//

export function interpretarSituacaoPesquisa(pesquisa) {

    if (!pesquisa) {
        return 'Indefinida';
    }

    // Pesquisa encerrada manualmente pela API.
    if (Number(pesquisa.status) === 1) {
        return 'Encerrada';
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataInicio = pesquisa.data_inicio
        ? new Date(pesquisa.data_inicio)
        : null;

    const dataFim = pesquisa.data_fim
        ? new Date(pesquisa.data_fim)
        : null;

    if (dataInicio) {
        dataInicio.setHours(0, 0, 0, 0);
    }

    if (dataFim) {
        dataFim.setHours(0, 0, 0, 0);
    }

    if (dataInicio && hoje < dataInicio) {
        return 'Agendada';
    }

    if (dataFim && hoje > dataFim) {
        return 'Encerrada';
    }

    return 'Em andamento';
}


//----------------- MONTAR INFORMAÇÕES ----------------------//

function montarInformacoesPesquisas(pesquisas, participacoes) {

    const totalPesquisas = pesquisas.length;

    const pesquisasAndamento = pesquisas.filter(
        pesquisa =>
            interpretarSituacaoPesquisa(pesquisa) === 'Em andamento'
    ).length;

    const pesquisasAgendadas = pesquisas.filter(
        pesquisa =>
            interpretarSituacaoPesquisa(pesquisa) === 'Agendada'
    ).length;

    const pesquisasEncerradas = pesquisas.filter(
        pesquisa =>
            interpretarSituacaoPesquisa(pesquisa) === 'Encerrada'
    ).length;

    const totalParticipacoes = participacoes.length;

    const participacoesConcluidas = participacoes.filter(
        participacao => Number(participacao.status) === 1
    ).length;

    const participacoesPendentes = participacoes.filter(
        participacao => Number(participacao.status) === 0
    ).length;

    return {
        totalPesquisas,
        pesquisasAndamento,
        pesquisasAgendadas,
        pesquisasEncerradas,
        totalParticipacoes,
        participacoesConcluidas,
        participacoesPendentes
    };
}

export default montarInformacoesPesquisas;