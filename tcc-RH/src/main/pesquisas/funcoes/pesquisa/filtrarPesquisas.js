//----------------- FILTRAR PESQUISAS ----------------------//

import {
    interpretarSituacaoPesquisa
} from './montarInformacoesPesquisas.js';


function filtrarPesquisas(pesquisas, filtros) {

    const pesquisaTexto = filtros?.pesquisa
        ?.toLowerCase()
        .trim() ?? '';

    const statusSelecionado = filtros?.status ?? 'Todos';

    return pesquisas.filter(pesquisa => {

        const titulo = pesquisa.titulo?.toLowerCase() ?? '';
        const descricao = pesquisa.descricao?.toLowerCase() ?? '';

        const correspondePesquisa =
            titulo.includes(pesquisaTexto) ||
            descricao.includes(pesquisaTexto);

        const situacao = interpretarSituacaoPesquisa(pesquisa);

        const correspondeStatus =
            statusSelecionado === 'Todos' ||
            situacao === statusSelecionado;

        return correspondePesquisa && correspondeStatus;
    });
}

export default filtrarPesquisas;