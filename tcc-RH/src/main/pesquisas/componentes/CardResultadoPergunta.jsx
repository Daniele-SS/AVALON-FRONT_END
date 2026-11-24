
import GraficoAlternativasPesquisa from './GraficoAlternativasPesquisa.jsx';

import './css-componentes/cardResultadoPergunta.css';


//----------------- IDENTIFICAR ID DA PERGUNTA -------------------------//

function buscarIdPergunta(resposta) {

    return Number(
        resposta?.id_pergunta ??
        resposta?.pergunta?.id
    );

}


//----------------- IDENTIFICAR ID DA PESQUISA -------------------------//

function buscarIdPesquisaParticipacao(participacao) {

    return Number(
        participacao?.id_pesquisa ??
        participacao?.pesquisa?.id
    );

}


//----------------- IDENTIFICAR ID DA PARTICIPAÇÃO ---------------------//

function buscarIdParticipacao(resposta) {

    return Number(
        resposta?.id_participacao ??
        resposta?.participacao?.id
    );

}


//----------------- FORMATAR RESPOSTA DISCURSIVA ----------------------//

function formatarRespostaDiscursiva(resposta) {

    if (resposta === null || resposta === undefined) {
        return '';
    }

    return String(resposta).trim();

}


//----------------- COMPONENTE ----------------------------------------//

function CardResultadoPergunta({
    pergunta,
    pesquisa,
    pesquisaResultados = [],
    respostas = [],
    participacoes = [],
    mostrarResultados = true
}) {

    const tipoPergunta = String(
        pergunta?.tipo || ''
    ).toLowerCase();


    //----------------- FILTRAR RESPOSTAS DA PERGUNTA -----------------//

    const respostasDaPergunta = respostas.filter(resposta => {

        return buscarIdPergunta(resposta) === Number(pergunta?.id);

    });


    //----------------- FILTRAR PARTICIPAÇÕES DA PESQUISA -------------//

    const participacoesDaPesquisa = participacoes.filter(participacao => {

        return buscarIdPesquisaParticipacao(participacao) ===
            Number(pesquisa?.id ?? pergunta?.pesquisa?.id);

    });


    const idsParticipacoes = new Set(
        participacoesDaPesquisa.map(participacao =>
            Number(participacao.id ?? participacao.id_participacao)
        )
    );


    //----------------- RESPOSTAS DISCURSIVAS --------------------------//

    const respostasDiscursivas = respostasDaPergunta
        .filter(resposta => {

            const idParticipacao = buscarIdParticipacao(resposta);

            return idsParticipacoes.has(idParticipacao);

        })
        .map(resposta => {

            return formatarRespostaDiscursiva(resposta.valor);

        })
        .filter(resposta => resposta !== '');


    //----------------- RENDERIZAR -------------------------------------//

    return (
        <article className="card-resultado-pergunta">

            {tipoPergunta === 'alternativa' ? (

                <GraficoAlternativasPesquisa
                    pergunta={pergunta}
                    pesquisa={pesquisa}
                    pesquisaResultados={pesquisaResultados}
                    mostrarResultados={mostrarResultados}
                />

            ) : tipoPergunta === 'discursiva' ? (

                <div className="resultado-discursivo-pesquisa">

                    <div className="cabecalho-discursivo-pesquisa">

                        <h3>
                            {pergunta?.enunciado || 'Pergunta'}
                        </h3>

                        <span className="tipo-pergunta-pesquisa">
                            Discursiva
                        </span>

                    </div>


                    {respostasDiscursivas.length > 0 ? (

                        <div className="lista-respostas-discursivas">

                            {respostasDiscursivas.map((resposta, indice) => (

                                <div
                                    className="resposta-discursiva-pesquisa"
                                    key={`${pergunta.id}-${indice}`}
                                >
                                    {resposta}
                                </div>

                            ))}

                        </div>

                    ) : (

                        <p className="sem-respostas-discursivas">
                            Ainda não existem respostas para esta pergunta.
                        </p>

                    )}

                </div>

            ) : (

                <div className="resultado-tipo-desconhecido">

                    <h3>
                        {pergunta?.enunciado || 'Pergunta'}
                    </h3>

                    <p>
                        Não foi possível identificar o tipo desta pergunta.
                    </p>

                </div>

            )}

        </article>
    );

}

export default CardResultadoPergunta;
