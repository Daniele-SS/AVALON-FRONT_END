
/********************************************************************************
 * Objetivo: Exibir os detalhes de um feedback e sua resposta.
 ********************************************************************************/

import './css-componentes/detalhesFeedback.css';

function DetalhesFeedback({ feedback, onFechar }) {

    if (!feedback) return null;

    return (

        <div
            className="fundo-detalhes-feedback"
            onClick={onFechar}
        >

            <div
                className="janela-detalhes-feedback"
                onClick={evento => evento.stopPropagation()}
            >

                {/*----------------- CABEÇALHO ----------------*/}

                <div className="cabecalho-detalhes-feedback">

                    <div>

                        <h2>Detalhes do Feedback</h2>

                        <p>Visualização das informações registradas.</p>

                    </div>


                    <button
                        type="button"
                        onClick={onFechar}
                        className="fechar-detalhes-feedback"
                    >
                        ×
                    </button>

                </div>


                {/*----------------- INFORMAÇÕES --------------*/}

                <div className="conteudo-detalhes-feedback">

                    <div className="detalhes-tipo-data">

                        <span className="feedback-tipo">
                            {feedback.tipoFormatado}
                        </span>

                        <span className="feedback-data">
                            {feedback.dataFormatada}
                        </span>

                    </div>


                    <div className="detalhes-pessoas">

                        <div>

                            <span>Remetente</span>

                            <strong>{feedback.remetente.nome}</strong>

                            <small>{feedback.remetente.cargo}</small>

                        </div>


                        <div>

                            <span>Destinatário</span>

                            <strong>{feedback.destinatario.nome}</strong>

                            <small>{feedback.destinatario.cargo}</small>

                        </div>

                    </div>


                    <div className="detalhes-bloco">

                        <h3>Descrição do feedback</h3>

                        <p>{feedback.descricao}</p>

                    </div>


                    {/*----------------- RESPOSTA ----------------*/}

                    <div className="detalhes-bloco">

                        <h3>Resposta do colaborador</h3>

                        {feedback.resposta ? (

                            <>

                                <p>{feedback.resposta.descricao}</p>

                                <span className="data-resposta-feedback">

                                    Respondido em {feedback.resposta.dataFormatada}

                                </span>

                            </>

                        ) : (

                            <p className="sem-resposta-feedback">

                                Este feedback ainda não possui resposta ativa.

                            </p>

                        )}

                    </div>

                </div>


                {/*----------------- RODAPÉ ---------------------*/}

                <div className="rodape-detalhes-feedback">

                    <button
                        type="button"
                        onClick={onFechar}
                    >
                        Fechar
                    </button>

                </div>

            </div>

        </div>

    );

}

export default DetalhesFeedback;
