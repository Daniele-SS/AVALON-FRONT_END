
/********************************************************************************
 * Objetivo: Filtrar os feedbacks por nome e setor.
 ********************************************************************************/

function filtrarFeedbacks(feedbacks, pesquisa, setor) {

    //----------------- FILTRAR FEEDBACKS --------------//

    return feedbacks.filter(feedback => {

        //----------------- PESQUISA POR NOME -----------//

        const nomeRemetente =
            feedback.remetente.nome.toLowerCase();

        const nomeDestinatario =
            feedback.destinatario.nome.toLowerCase();

        const textoPesquisa = pesquisa.trim().toLowerCase();

        const encontrouNome =
            nomeRemetente.includes(textoPesquisa) ||
            nomeDestinatario.includes(textoPesquisa);


        //----------------- FILTRO POR SETOR ------------//

        const setorRemetente =
            feedback.remetente.setor;

        const setorDestinatario =
            feedback.destinatario.setor;

        const encontrouSetor =
            setor === 'Todos' ||
            setorRemetente === setor ||
            setorDestinatario === setor;


        //----------------- RESULTADO -------------------//

        return encontrouNome && encontrouSetor;

    });

}


//----------------- EXPORTAÇÃO ------------------------//

export default filtrarFeedbacks;
