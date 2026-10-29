
 //----------------- FILTRAR BENEFÍCIOS ----------------------//

function filtrarBeneficios(beneficios, filtros) {

    return beneficios.filter(beneficio => {

        // Obter o texto da pesquisa.
        const pesquisa = (filtros.pesquisa || '')
            .trim()
            .toLowerCase();

        // Pesquisar pelo nome do benefício.
        const correspondePesquisa =
            (beneficio.nome || '')
                .toLowerCase()
                .includes(pesquisa);

        // Obter o status do benefício.
        const statusBeneficio = Number(beneficio.status);

        // Filtrar por status.
        const correspondeStatus =
            filtros.status === 'Todos' ||
            (
                filtros.status === 'Ativos' &&
                statusBeneficio === 1
            ) ||
            (
                filtros.status === 'Inativos' &&
                statusBeneficio === 0
            );

        // Filtrar pela disponibilidade, se selecionada.
        const correspondeDisponibilidade =
            !filtros.opcao ||
            beneficio.disponibilidade === filtros.opcao;

        // Retornar somente os benefícios correspondentes.
        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeDisponibilidade
        );

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default filtrarBeneficios;
