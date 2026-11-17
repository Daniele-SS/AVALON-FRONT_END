
/********************************************************************************
 * Objetivo: Organizar os feedbacks em uma linha do tempo.
 ********************************************************************************/

import CardFeedback from './CardFeedback';

import './css-componentes/linhaTempoFeedback.css';


//----------------- IDENTIFICAR DATA ------------------//

function identificarPeriodo(data) {

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const ontem = new Date(hoje);

    ontem.setDate(hoje.getDate() - 1);


    const dataFeedback = new Date(data);

    dataFeedback.setHours(0, 0, 0, 0);


    if (dataFeedback.getTime() === hoje.getTime()) {
        return 'HOJE';
    }

    if (dataFeedback.getTime() === ontem.getTime()) {
        return 'ONTEM';
    }


    const inicioSemana = new Date(hoje);

    inicioSemana.setDate(
        hoje.getDate() - hoje.getDay()
    );


    if (dataFeedback >= inicioSemana) {
        return 'ESTA SEMANA';
    }


    const inicioSemanaPassada = new Date(inicioSemana);

    inicioSemanaPassada.setDate(
        inicioSemana.getDate() - 7
    );


    if (dataFeedback >= inicioSemanaPassada) {
        return 'SEMANA PASSADA';
    }


    return dataFeedback.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).toUpperCase();

}


//----------------- COMPONENTE PRINCIPAL --------------//

function LinhaTempoFeedback({ feedbacks, onVisualizar }) {

    //----------------- AGRUPAR FEEDBACKS --------------//

    const grupos = feedbacks.reduce((acumulador, feedback) => {

        const periodo = identificarPeriodo(feedback.data);

        if (!acumulador[periodo]) {
            acumulador[periodo] = [];
        }

        acumulador[periodo].push(feedback);

        return acumulador;

    }, {});


    //----------------- EXIBIR RESULTADO ---------------//

    if (feedbacks.length === 0) {

        return (

            <div className="feedback-vazio">

                <span>Não encontramos feedbacks.</span>

                <p>Experimente alterar os filtros utilizados.</p>

            </div>

        );

    }


    //----------------- RETORNAR LINHA DO TEMPO --------//

    return (

        <div className="linha-tempo-feedback">

            {Object.entries(grupos).map(([periodo, itens]) => (

                <div className="grupo-tempo-feedback" key={periodo}>

                    <div className="marcador-tempo-feedback">

                        <span className="ponto-tempo-feedback"></span>

                        <strong>{periodo}</strong>

                        {periodo !== 'HOJE' &&
                            periodo !== 'ONTEM' &&
                            periodo !== 'ESTA SEMANA' &&
                            periodo !== 'SEMANA PASSADA' && (

                                <span className="data-grupo-feedback">
                                    {itens[0].dataFormatada}
                                </span>

                            )}

                    </div>


                    <div className="lista-tempo-feedback">

                        {itens.map(feedback => (

                            <CardFeedback
                                key={feedback.id}
                                feedback={feedback}
                                onVisualizar={onVisualizar}
                            />

                        ))}

                    </div>

                </div>

            ))}

        </div>

    );

}

export default LinhaTempoFeedback;
