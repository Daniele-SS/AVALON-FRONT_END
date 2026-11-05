//----------------- FILTRAR DOCUMENTOS -------------------------------//

function filtrarDocumentos(documentos = [], filtros = {}) {

    //----------------- OBTER FILTROS --------------------------------//

    const pesquisa = (filtros.pesquisa || '').toLowerCase().trim();

    const status = filtros.status || 'Todos';

    const opcao = filtros.opcao || '';


    //----------------- APLICAR FILTROS ------------------------------//

    return documentos.filter(documento => {

        //----------------- DADOS DO COLABORADOR --------------------//

        const colaborador = documento.colaborador?.[0] || {};

        const nomeColaborador = colaborador.nome || '';

        const setor = colaborador.setor?.[0]?.nome || '';

        const cargo = colaborador.cargo?.nome || '';


        //----------------- PESQUISA ---------------------------------//

        const correspondePesquisa =

            documento.nome?.toLowerCase().includes(pesquisa) ||

            documento.tipo_documento?.toLowerCase().includes(pesquisa) ||

            nomeColaborador.toLowerCase().includes(pesquisa) ||

            setor.toLowerCase().includes(pesquisa) ||

            cargo.toLowerCase().includes(pesquisa);


        //----------------- STATUS -----------------------------------//

        const ativo = Number(documento.ativo) === 1;

        const correspondeStatus =

            status === 'Todos' ||

            (status === 'Ativos' && ativo) ||

            (status === 'Arquivados' && !ativo) ||

            (status === 'Inativos' && !ativo);


        //----------------- TIPO DE DOCUMENTO ------------------------//

        const correspondeOpcao =

            opcao === '' ||

            documento.tipo_documento === opcao;


        //----------------- RESULTADO --------------------------------//

        return correspondePesquisa &&
               correspondeStatus &&
               correspondeOpcao;

    });

}


//----------------- EXPORTAÇÃO ---------------------------------------//

export default filtrarDocumentos;