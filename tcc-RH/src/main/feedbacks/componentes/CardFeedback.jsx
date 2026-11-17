
/********************************************************************************
 * Objetivo: Apresentar as informações de um feedback.
 ********************************************************************************/

import './css-componentes/cardFeedback.css';

function CardFeedback({ feedback, onVisualizar }) {

    return (

        <div className="card-feedback">

            {/*----------------- PESSOAS -----------------*/}

            <div className="feedback-pessoas">

                <div className="feedback-pessoa">

                    <div className="feedback-avatar avatar-remetente">
                        {feedback.remetente.iniciais}
                    </div>

                    <div className="feedback-dados-pessoa">

                        <strong>{feedback.remetente.nome}</strong>

                        <span>{feedback.remetente.cargo}</span>

                    </div>

                </div>


                <span className="feedback-seta">→</span>


                <div className="feedback-pessoa">

                    <div className="feedback-avatar avatar-destinatario">
                        {feedback.destinatario.iniciais}
                    </div>

                    <div className="feedback-dados-pessoa">

                        <strong>{feedback.destinatario.nome}</strong>

                        <span>{feedback.destinatario.cargo}</span>

                    </div>

                </div>

            </div>


            {/*----------------- ETIQUETAS ----------------*/}

            <div className="feedback-etiquetas">

                <span className={`feedback-tipo tipo-${feedback.tipo.toLowerCase()}`}>

                    {feedback.tipoFormatado}

                </span>


                <span className={`feedback-status ${feedback.resposta ? 'status-respondido' : 'status-registrado'}`}>

                    {feedback.status}

                </span>


                <span className="feedback-data">

                    {feedback.dataFormatada}

                </span>

            </div>


            {/*----------------- DESCRIÇÃO ----------------*/}

            <div className="feedback-descricao">

                "{feedback.descricao}"

            </div>


            {/*----------------- RODAPÉ -------------------*/}

            <div className="feedback-rodape">

                <div className="feedback-compartilhamento">

                    <span>◉</span>

                    <span>Direcionado ao colaborador</span>

                </div>


                <div className="feedback-informacao-resposta">

                    {feedback.resposta ? (

                        <span>
                            ✓ Resposta registrada
                        </span>

                    ) : (

                        <span>
                            ◷ Aguardando resposta
                        </span>

                    )}

                </div>


                <button
                    type="button"
                    className="botao-detalhes-feedback"
                    onClick={() => onVisualizar(feedback)}
                >

                    Ver detalhes →

                </button>

            </div>

        </div>

    );

}

export default CardFeedback;
