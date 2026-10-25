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


        //----------------- TODOS -----------------------------//

        if (
            !statusSelecionado ||
            statusSelecionado === 'todos'
        ) {

            // Férias finalizadas só aparecem
            // quando o usuário seleciona esse filtro.

            if (statusFerias === 'férias finalizadas') {
                return false;
            }

            return correspondePesquisa;

        }


        //----------------- STATUS ESPECÍFICO -----------------//

        const correspondeStatus =
            statusFerias === statusSelecionado;


        //----------------- RESULTADO -------------------------//

        return (
            correspondePesquisa &&
            correspondeStatus
        );

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default filtrarFerias;