
/* --------------------------------------------------------- */
/* FILTRAR AVALIAÇÕES PSICOSSOCIAIS                           */
/* --------------------------------------------------------- */

function filtrarAvaliacoes(avaliacoes, filtros) {

    // Garante que as avaliações sejam uma lista.
    const listaAvaliacoes = Array.isArray(avaliacoes) ? avaliacoes : [];

    // Recebe os filtros ou utiliza valores padrão.
    const pesquisa = filtros?.pesquisa?.toLowerCase().trim() || '';
    const status = filtros?.status || 'Todos';
    const opcao = filtros?.opcao || '';


    // ----------------------------------------------------- //
    // APLICA OS FILTROS
    // ----------------------------------------------------- //

    const avaliacoesFiltradas = listaAvaliacoes.filter((avaliacao) => {

        // Pesquisa pelo título da avaliação.
        const correspondePesquisa = (avaliacao.titulo || '')
            .toLowerCase()
            .includes(pesquisa);


        // Verifica o status da avaliação.
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dataInicio = avaliacao.data_inicio
            ? new Date(avaliacao.data_inicio)
            : null;

        const dataFim = avaliacao.data_fim
            ? new Date(avaliacao.data_fim)
            : null;

        if (dataInicio) dataInicio.setHours(0, 0, 0, 0);
        if (dataFim) dataFim.setHours(0, 0, 0, 0);

        let statusAvaliacao = 'Agendada';

        if (Number(avaliacao.status) === 1 || (dataFim && hoje > dataFim)) {

            statusAvaliacao = 'Encerrada';

        } else if (dataInicio && dataFim && hoje >= dataInicio && hoje <= dataFim) {

            statusAvaliacao = 'Em andamento';

        }


        const correspondeStatus =
            status === 'Todos' || status === statusAvaliacao;


        // Verifica a opção de público selecionado.
        const correspondeOpcao =
            opcao === '' ||
            String(avaliacao.id) === String(opcao);


        // Retorna somente avaliações que correspondem aos filtros.
        return correspondePesquisa && correspondeStatus && correspondeOpcao;

    });


    return avaliacoesFiltradas;

}


// Exporta a função.
export default filtrarAvaliacoes;
