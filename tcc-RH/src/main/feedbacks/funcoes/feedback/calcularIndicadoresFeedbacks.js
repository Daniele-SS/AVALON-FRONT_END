
/********************************************************************************
 * Objetivo: Calcular os indicadores da tela de Feedbacks.
 ********************************************************************************/

function calcularIndicadoresFeedbacks(feedbacks) {

    //----------------- DATA ATUAL ---------------------//

    const hoje = new Date();

    const mesAtual = hoje.getMonth();

    const anoAtual = hoje.getFullYear();


    //----------------- FEEDBACKS ATIVOS ---------------//

    const feedbacksAtivos = feedbacks.filter(
        feedback => feedback.ativo
    );


    //----------------- FEEDBACKS DO MÊS ---------------//

    const feedbacksMes = feedbacksAtivos.filter(feedback => {

        return (
            feedback.data.getMonth() === mesAtual &&
            feedback.data.getFullYear() === anoAtual
        );

    });


    //----------------- FEEDBACKS PENDENTES ------------//

    const pendentes = feedbacksAtivos.filter(
        feedback => !feedback.resposta
    );


    //----------------- FEEDBACKS RESPONDIDOS ----------//

    const respondidos = feedbacksAtivos.filter(
        feedback => feedback.resposta
    );


    //----------------- TAXA DE RESPOSTA ---------------//

    const taxaResposta = feedbacksAtivos.length > 0

        ? Math.round(
            (respondidos.length / feedbacksAtivos.length) * 100
        )

        : 0;


    //----------------- RETORNAR INDICADORES -----------//

    return {

        feedbacksMes: feedbacksMes.length,

        pendentes: pendentes.length,

        registrados: feedbacksAtivos.length,

        taxaResposta

    };

}


//----------------- EXPORTAÇÃO ------------------------//

export default calcularIndicadoresFeedbacks;
