//----------------- FILTRAR JORNADAS -----------------------------//

function filtrarJornadas(jornadas, filtros = {}) {

    if (!Array.isArray(jornadas)) {
        return [];
    }

    const pesquisa = String(filtros.pesquisa || '')
        .trim()
        .toLowerCase();

    return jornadas.filter((jornada) => {

        const correspondePesquisa = String(jornada.nome || '')
            .toLowerCase()
            .includes(pesquisa);

        const status = Number(jornada.status);

        const correspondeStatus =
            !filtros.status ||
            filtros.status === 'Todos' ||
            (filtros.status === 'Ativos' && status === 1) ||
            (filtros.status === 'Inativos' && status === 0);

        const correspondeOpcao =
            !filtros.opcao ||
            String(jornada.id) === String(filtros.opcao);

        return correspondePesquisa && correspondeStatus && correspondeOpcao;
    });
}

//----------------- EXPORTAÇÃO -----------------------------------//

export default filtrarJornadas;