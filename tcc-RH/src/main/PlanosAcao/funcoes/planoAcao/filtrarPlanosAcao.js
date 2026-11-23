
/****************************************************************
 * Objetivo: Filtrar os planos de ação por pesquisa,
 *           status e setor.
 ****************************************************************/

function filtrarPlanosAcao(planos = [], filtros = {}) {

    const pesquisa = String(
        filtros.pesquisa || ''
    ).toLowerCase().trim();

    //----------------- FILTRAR PLANOS ---------------------//

    return planos.filter((plano) => {

        const setor = Array.isArray(plano.setor)
            ? plano.setor[0]
            : plano.setor;

        const fator =
            plano.psicossocial_fator?.psicossocialFator ||
            plano.psicossocial_fator ||
            null;

        const nomeSetor = setor?.nome || '';
        const nomeFator = fator?.nome || '';

        const nomeResponsavel =
            plano.colaborador?.nome || '';

        const titulo = String(
            plano.titulo || ''
        ).toLowerCase();

        //----------------- PESQUISA ------------------------//

        const correspondePesquisa =
            titulo.includes(pesquisa) ||
            nomeResponsavel.toLowerCase().includes(pesquisa) ||
            nomeSetor.toLowerCase().includes(pesquisa) ||
            nomeFator.toLowerCase().includes(pesquisa);

        //----------------- STATUS --------------------------//

        // Status 0 = ativo.
        // Status 1 = concluído/inativo.
        const statusPlano = Number(plano.status);

        const correspondeStatus =
            filtros.status === 'Todos' ||
            !filtros.status ||
            (
                filtros.status === 'Ativos' &&
                statusPlano === 0
            ) ||
            (
                (
                    filtros.status === 'Inativos' ||
                    filtros.status === 'Concluído' ||
                    filtros.status === 'Concluidos'
                ) &&
                statusPlano === 1
            );

        //----------------- SETOR ---------------------------//

        const correspondeSetor =
            filtros.opcao === '' ||
            !filtros.opcao ||
            nomeSetor === filtros.opcao;

        //----------------- RETORNO -------------------------//

        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeSetor
        );

    });

}

//----------------- EXPORTAÇÃO -----------------------------//

export default filtrarPlanosAcao;
