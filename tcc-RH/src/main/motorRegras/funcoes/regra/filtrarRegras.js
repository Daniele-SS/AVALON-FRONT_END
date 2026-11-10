
//----------------- FILTRAR REGRAS --------------------------//

function filtrarRegras(regras, filtros = {}) {

    if (!Array.isArray(regras)) {
        return [];
    }

    const pesquisa = String(filtros.pesquisa || '')
        .trim()
        .toLowerCase();


    //----------------- APLICAR FILTROS ---------------------//

    return regras.filter((regra) => {

        const fator = regra.fator_psicossocial
            ?.psicossocialFator;


        //----------------- PESQUISA -------------------------//

        const correspondePesquisa =

            String(fator?.nome || '')
                .toLowerCase()
                .includes(pesquisa) ||

            String(regra.acao || '')
                .toLowerCase()
                .includes(pesquisa) ||

            String(regra.id || '')
                .includes(pesquisa);


        //----------------- STATUS ---------------------------//

        const status = Number(regra.ativo);

        const correspondeStatus =

            !filtros.status ||
            filtros.status === 'Todos' ||

            (filtros.status === 'Ativos' && status === 1) ||

            (filtros.status === 'Inativos' && status === 0);


        //----------------- FATOR ----------------------------//

        const correspondeFator =

            !filtros.opcao ||

            String(fator?.id) === String(filtros.opcao);


        //----------------- CLASSIFICAÇÃO --------------------//

        const correspondeClassificacao =

            !filtros.classificacao ||
            filtros.classificacao === 'Todos' ||

            String(regra.classificacao).toUpperCase() ===
                filtros.classificacao.toUpperCase();


        //----------------- RETORNAR RESULTADO ---------------//

        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeFator &&
            correspondeClassificacao
        );

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default filtrarRegras;
