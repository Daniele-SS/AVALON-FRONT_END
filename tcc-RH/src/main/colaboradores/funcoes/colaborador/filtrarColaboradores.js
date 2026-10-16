//----------------- FILTRAR COLABORADORES ------------------//

function filtrarColaboradores(colaboradores, filtros) {

    return colaboradores.filter(colaborador => {


        //----------------- PESQUISA -------------------------//

        const pesquisa = (filtros.pesquisa || '')
            .trim()
            .toLowerCase();

        const nome = String(colaborador.nome || '').toLowerCase();

        const matricula = String(colaborador.matricula || '').toLowerCase();

        const cargo = String(colaborador.nome_cargo || '').toLowerCase();

        const setor = String(colaborador.nome_setor || '').toLowerCase();

        const gestor = String(colaborador.gestor_direto || '').toLowerCase();


        const correspondePesquisa =
            nome.includes(pesquisa) ||
            matricula.includes(pesquisa) ||
            cargo.includes(pesquisa) ||
            setor.includes(pesquisa) ||
            gestor.includes(pesquisa);


        //----------------- STATUS ---------------------------//

        const statusColaborador = String(colaborador.status)
            .trim()
            .toLowerCase();

        const statusFiltro = String(filtros.status || 'Todos')
            .trim()
            .toLowerCase();

        const correspondeStatus =
            statusFiltro === 'todos' ||
            (statusFiltro === 'ativo' || statusFiltro === 'ativos')
                ? (
                    statusFiltro === 'todos' ||
                    statusColaborador === 'ativo'
                )
                : (
                    statusFiltro === 'inativo' ||
                    statusFiltro === 'inativos'
                )
                    ? statusColaborador === 'inativo'
                    : true;


        //----------------- OPÇÃO DO DROPDOWN ----------------//

        const correspondeOpcao =
            !filtros.opcao ||
            String(colaborador.id) === String(filtros.opcao);


        //----------------- RESULTADO ------------------------//

        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeOpcao
        );

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default filtrarColaboradores;