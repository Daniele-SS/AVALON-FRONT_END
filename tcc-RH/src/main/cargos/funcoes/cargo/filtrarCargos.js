//----------------- FILTRAR CARGOS --------------------------//

function filtrarCargos(cargos, filtros) {
    return cargos.filter(cargo => {
        const pesquisa = (filtros.pesquisa || '').trim().toLowerCase();

        // Pesquisar por cargo, setor ou código
        const correspondePesquisa =
            (cargo.nome_cargo || cargo.nome || '')
                .toLowerCase()
                .includes(pesquisa) ||

            (cargo.nome_setor || '')
                .toLowerCase()
                .includes(pesquisa) ||

            String(cargo.codigo || '')
                .toLowerCase()
                .includes(pesquisa);

        // Filtrar pelo status
        const statusCargo = Number(cargo.status);

        const correspondeStatus =
            filtros.status === 'Todos' ||
            (filtros.status === 'Ativos' && statusCargo === 1) ||
            (filtros.status === 'Inativos' && statusCargo === 0);

        // Filtrar pelo cargo selecionado
        const correspondeCargo =
            !filtros.opcao ||
            String(cargo.cargo_id ?? cargo.id) === String(filtros.opcao);

        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeCargo
        );
    });
}

//----------------- EXPORTAÇÃO ------------------------------//

export default filtrarCargos;