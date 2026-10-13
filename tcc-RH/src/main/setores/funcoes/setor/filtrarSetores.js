//----------------- FILTRAR SETORES -------------------------//

function filtrarSetores(setores, filtros) {

    return setores.filter(setor => {

        const pesquisa = (filtros.pesquisa || '')
            .toLowerCase()
            .trim();

        const nome = (setor.nome || '').toLowerCase();

        const codigo = String(setor.codigo || '').toLowerCase();

        const gestor = (setor.gestor_responsavel || '').toLowerCase();


        //----------------- PESQUISA ------------------------//

        const correspondePesquisa =
            nome.includes(pesquisa) ||
            codigo.includes(pesquisa) ||
            gestor.includes(pesquisa);


        //----------------- STATUS --------------------------//

        const correspondeStatus =
            filtros.status === 'Todos' ||

            (
                filtros.status === 'Ativos' &&
                Number(setor.status) === 1
            ) ||

            (
                filtros.status === 'Inativos' &&
                Number(setor.status) === 0
            );


        //----------------- SETOR SELECIONADO ----------------//

        const correspondeOpcao =
            filtros.opcao === '' ||
            String(setor.id) === String(filtros.opcao);


        //----------------- RESULTADO -----------------------//

        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeOpcao
        );

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default filtrarSetores;