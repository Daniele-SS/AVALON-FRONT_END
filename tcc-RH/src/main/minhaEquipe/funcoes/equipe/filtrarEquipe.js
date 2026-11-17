
/********************************************************************************
 * Objetivo: Filtrar os colaboradores da Minha Equipe.
 ********************************************************************************/

function filtrarEquipe(equipe, filtros) {

    return equipe.filter(colaborador => {

        //----------------- PESQUISA -------------------------//

        const pesquisa = String(filtros.pesquisa || '')
            .trim()
            .toLowerCase();

        const correspondePesquisa = [

            colaborador.nome,
            colaborador.matricula,
            colaborador.nome_cargo,
            colaborador.nome_setor,
            colaborador.gestor_direto

        ].some(valor =>
            String(valor || '').toLowerCase().includes(pesquisa)
        );


        //----------------- STATUS ---------------------------//

        const status = String(colaborador.status || '')
            .trim()
            .toLowerCase();

        const filtroStatus = String(filtros.status || 'Todos')
            .trim()
            .toLowerCase();

        const correspondeStatus =
            filtroStatus === 'todos' ||
            (['ativo', 'ativos'].includes(filtroStatus) && status === 'ativo') ||
            (['inativo', 'inativos'].includes(filtroStatus) && status === 'inativo');


        //----------------- CARGO ----------------------------//

        const cargo = String(colaborador.nome_cargo || '')
            .trim()
            .toLowerCase();

        const correspondeCargo =
            !filtros.opcao ||
            cargo === String(filtros.opcao).trim().toLowerCase();


        //----------------- RESULTADO ------------------------//

        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeCargo
        );

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default filtrarEquipe;
