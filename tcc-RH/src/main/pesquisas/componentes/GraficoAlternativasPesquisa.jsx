
import { calcularMediaSatisfacao } from '../funcoes/acompanhamento/calcularMediaSatisfacao.js';

import './css-componentes/graficoAlternativasPesquisa.css';


//----------------- ALTERNATIVAS PADRÃO -------------------------//

const alternativasPadrao = [
    'Excelente',
    'Bom',
    'Regular',
    'Ruim',
    'Muito ruim'
];


//----------------- IDENTIFICAR ID DA PERGUNTA -----------------//

function buscarIdPergunta(resultado) {

    return Number(
        resultado?.pergunta?.id ??
        resultado?.id_pergunta ??
        resultado?.pergunta?.id_pergunta
    );

}


//----------------- IDENTIFICAR ID DA PESQUISA ------------------//

function buscarIdPesquisa(resultado) {

    return Number(
        resultado?.pesquisa?.id ??
        resultado?.pergunta?.pesquisa?.id ??
        resultado?.id_pesquisa
    );

}


//----------------- FORMATAR MÉDIA ------------------------------//

function formatarMedia(media) {

    if (media === null || media === undefined) {
        return '--';
    }

    return media.toFixed(1).replace('.', ',');

}


//----------------- COMPONENTE ----------------------------------//

function GraficoAlternativasPesquisa({
    pergunta,
    pesquisa,
    pesquisaResultados = [],
    mostrarResultados = true
}) {

    const idPergunta = Number(pergunta?.id);

    const idPesquisa = Number(
        pesquisa?.id ??
        pergunta?.pesquisa?.id
    );


    //----------------- FILTRAR RESULTADOS ----------------------//

    const resultadosPergunta = pesquisaResultados.filter(resultado => {

        return buscarIdPergunta(resultado) === idPergunta &&
            buscarIdPesquisa(resultado) === idPesquisa;

    });


    //----------------- PREPARAR ALTERNATIVAS ------------------//

    const alternativasExistentes = resultadosPergunta.map(resultado => {

        return String(resultado.valor_resposta || '').trim();

    }).filter(alternativa => alternativa !== '');


    const alternativas = [
        ...new Set([
            ...alternativasPadrao,
            ...alternativasExistentes
        ])
    ];


    //----------------- PREPARAR DADOS DO GRÁFICO --------------//

    const dadosAlternativas = alternativas.map(alternativa => {

        const resultado = resultadosPergunta.find(item => {

            return String(item.valor_resposta || '').trim() === alternativa;

        });


        const quantidade = mostrarResultados
            ? Number(resultado?.quantidade_resposta || 0)
            : 0;


        return {
            alternativa,
            quantidade
        };

    });


    //----------------- CALCULAR TOTAL --------------------------//

    const totalRespostas = dadosAlternativas.reduce(
        (total, alternativa) => {

            return total + alternativa.quantidade;

        },
        0
    );


    //----------------- CALCULAR MÉDIA --------------------------//

    const respostasParaMedia = dadosAlternativas.flatMap(alternativa => {

        return Array.from(
            { length: Math.max(0, alternativa.quantidade) },
            () => alternativa.alternativa
        );

    });


    const mediaSatisfacao = mostrarResultados
        ? calcularMediaSatisfacao(respostasParaMedia)
        : null;


    //----------------- RENDERIZAR -------------------------------//

    return (
        <div className="grafico-alternativas-pesquisa">

            <div className="cabecalho-grafico-pesquisa">

                <h3>
                    {pergunta?.enunciado || 'Pergunta'}
                </h3>

                <div className="media-satisfacao-pesquisa">

                    <span className="media-satisfacao-valor">
                        {formatarMedia(mediaSatisfacao)}
                    </span>

                    <span className="media-satisfacao-total">
                        / 5
                    </span>

                    <span className="media-satisfacao-legenda">
                        Média de satisfação
                    </span>

                </div>

            </div>


            {!mostrarResultados && (

                <p className="aviso-privacidade-pesquisa">
                    Os resultados serão exibidos quando houver pelo
                    menos 1 respostas válidas.
                </p>

            )}


            <div className="lista-alternativas-pesquisa">

                {dadosAlternativas.map((alternativa, indice) => {

                    const quantidade = alternativa.quantidade;

                    const percentual = totalRespostas > 0
                        ? (quantidade / totalRespostas) * 100
                        : 0;

                    const percentualLimitado = Math.min(
                        100,
                        Math.max(0, percentual)
                    );


                    return (
                        <div
                            className="linha-alternativa-pesquisa"
                            key={`${pergunta.id}-${alternativa.alternativa}-${indice}`}
                        >

                            <span className="nome-alternativa-pesquisa">
                                {alternativa.alternativa}
                            </span>


                            <div className="fundo-barra-alternativa">

                                <div
                                    className="barra-alternativa-pesquisa"
                                    style={{
                                        width: `${percentualLimitado}%`
                                    }}
                                />

                            </div>


                            <div className="informacoes-alternativa-pesquisa">

                                <span className="percentual-alternativa-pesquisa">
                                    {percentual.toLocaleString('pt-BR', {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 2
                                    })}%
                                </span>

                                <span className="quantidade-alternativa-pesquisa">
                                    {quantidade} resposta
                                    {quantidade !== 1 ? 's' : ''}
                                </span>

                            </div>

                        </div>
                    );

                })}

            </div>


            <div className="rodape-grafico-pesquisa">

                <span>
                    Total de respostas
                </span>

                <strong>
                    {totalRespostas}
                </strong>

            </div>

        </div>
    );

}

export default GraficoAlternativasPesquisa;
