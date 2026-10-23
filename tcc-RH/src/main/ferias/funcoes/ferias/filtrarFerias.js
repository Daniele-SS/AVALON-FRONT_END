
 //----------------- FILTRAR FÉRIAS --------------------------//

 function filtrarFerias(ferias, filtros) {

    return ferias.filter(feriasItem => {

        //----------------- PESQUISA --------------------------//

        const pesquisa = (filtros.pesquisa || '')
            .trim()
            .toLowerCase();

        const nome = (feriasItem.nome_colaborador || '')
            .toLowerCase();

        const matricula = (feriasItem.matricula || '')
            .toLowerCase();

        const setor = (feriasItem.nome_setor || '')
            .toLowerCase();

        const correspondePesquisa =
            nome.includes(pesquisa) ||
            matricula.includes(pesquisa) ||
            setor.includes(pesquisa);


        //----------------- STATUS ----------------------------//

        const statusSelecionado = (filtros.opcao || '')
            .trim()
            .toLowerCase();

        const statusFerias = (feriasItem.status || '')
            .trim()
            .toLowerCase();

        const correspondeStatus =
            !statusSelecionado ||
            statusSelecionado === 'todos' ||
            statusFerias === statusSelecionado;


        //----------------- RESULTADO -------------------------//

        return correspondePesquisa && correspondeStatus;

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default filtrarFerias;
