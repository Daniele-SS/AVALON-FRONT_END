
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import buscarParticipacoesAvaliacao from './servico/acompanhamento/buscarParticipacoesAvaliacao.js';
import buscarRespostasAvaliacao from './servico/acompanhamento/buscarRespostasAvaliacao.js';
import buscarFatoresAvaliacao from './servico/acompanhamento/buscarFatoresAvaliacao.js';
import buscarRegrasAvaliacao from './servico/acompanhamento/buscarRegrasAvaliacao.js';

import agruparRespostas from './funcoes/acompanhamento/agruparRespostas.js';
import calcularMedias from './funcoes/acompanhamento/calcularMedias.js';
import montarResultadosFatores from './funcoes/acompanhamento/montarResultadosFatores.js';

import './css-avaliacaoPsicossocial/acompanhamentoAvaliacao.css';


//----------------- CONFIGURAÇÕES ---------------------------//

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;
const INTERVALO_ATUALIZACAO = 30000;


//----------------- COMPONENTE PRINCIPAL --------------------//

function AcompanhamentoAvaliacao({ avaliacao, onVoltar }) {

    //----------------- ESTADOS -------------------------------//

    const [resultados, setResultados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [regras, setRegras] = useState([]);


    //----------------- CARREGAR DADOS ------------------------//

    async function carregarAcompanhamento(exibirCarregamento = false) {

        try {

            if (exibirCarregamento) {
                setCarregando(true);
            }

            setErro('');

            const [
                participacoes,
                respostas,
                fatores,
                regrasVinculadas
            ] = await Promise.all([

                buscarParticipacoesAvaliacao(avaliacao.id),
                buscarRespostasAvaliacao(avaliacao.id),

                // Busca somente os fatores desta avaliação.
                buscarFatoresAvaliacao(avaliacao.id),

                buscarRegrasAvaliacao(avaliacao.id)

            ]);

            setRegras(regrasVinculadas);


            //----------------- AGRUPAR RESPOSTAS ---------------//

            const dadosAgrupados = agruparRespostas(
                participacoes,
                respostas
            );


            //----------------- CALCULAR MÉDIAS -----------------//

            const medias = calcularMedias(
                dadosAgrupados.respostasValidas,
                fatores,
                dadosAgrupados.setoresAvaliacao,
                QUANTIDADE_MINIMA_PARTICIPANTES
            );


            //----------------- MONTAR CLASSIFICAÇÕES ------------//

            const resultadosMontados = montarResultadosFatores(
                fatores,
                medias,
                regrasVinculadas
            );

            setResultados(resultadosMontados);

        } catch (erro) {

            console.error('Erro ao carregar acompanhamento:', erro);

            setErro(
                erro.message || 'Não foi possível carregar o acompanhamento.'
            );

        } finally {

            if (exibirCarregamento) {
                setCarregando(false);
            }

        }

    }


    //----------------- ATUALIZAÇÃO AUTOMÁTICA ----------------//

    useEffect(() => {

        if (!avaliacao?.id) {
            return;
        }

        carregarAcompanhamento(true);

        // Não atualiza automaticamente quando a avaliação estiver encerrada.
        if (Number(avaliacao.status) === 1) {
            return;
        }

        const intervalo = setInterval(() => {
            carregarAcompanhamento(false);
        }, INTERVALO_ATUALIZACAO);

        return () => {
            clearInterval(intervalo);
        };

    }, [avaliacao?.id, avaliacao?.status]);


    //----------------- CLASSIFICAÇÃO VISUAL ------------------//

    function obterClasseClassificacao(classificacao) {

        const valor = String(classificacao || '')
            .trim()
            .toUpperCase();

        switch (valor) {

            case 'NORMAL':
                return 'normal';

            case 'ATENÇÃO':
            case 'ATENCAO':
                return 'atencao';

            case 'PRIORIDADE':
                return 'prioridade';

            default:
                return 'indisponivel';

        }

    }


    //----------------- FORMATAÇÃO DA MÉDIA -------------------//

    function formatarMedia(media) {

        if (media === null || media === undefined) {
            return '--';
        }

        return Number(media).toFixed(1).replace('.', ',');

    }


    //----------------- BUSCAR REGRAS DO FATOR ----------------//

    function obterRegrasFator(fator) {

        return regras.filter((regra) => {

            return (
                Number(regra.id_psicossocial_fator) === Number(fator.id) &&
                Number(regra.ativo) === 1
            );

        });

    }


    //----------------- BUSCAR REGRA DE ATENÇÃO ----------------//

    function obterRegraAtencao(fator) {

        const regrasFator = obterRegrasFator(fator);

        return regrasFator.find((regra) => {

            const classificacao = String(regra.classificacao || '')
                .trim()
                .toUpperCase();

            return (
                classificacao === 'ATENÇÃO' ||
                classificacao === 'ATENCAO'
            );

        }) || null;

    }


    //----------------- BUSCAR PARÂMETRO VISUAL ---------------//

    function obterParametro(fator) {

        const regrasFator = obterRegrasFator(fator);

        if (regrasFator.length === 0) {
            return null;
        }

        const regraAtencao = obterRegraAtencao(fator);

        const regraReferencia = regraAtencao || regrasFator[0];

        const valor = Number(regraReferencia.valor_referencial);

        return Number.isFinite(valor) ? valor : null;

    }


    //----------------- TEXTO DO GATILHO ----------------------//

    function obterTextoGatilho(fator) {

        const regra = obterRegraAtencao(fator);

        if (!regra) {
            return 'Parâmetro não definido';
        }

        const valor = formatarMedia(regra.valor_referencial);

        return `Gatilho de Atenção (${regra.operador} ${valor})`;

    }


    //----------------- LARGURA DA BARRA ----------------------//

    function obterLargura(media) {

        if (media === null || media === undefined) {
            return '0%';
        }

        const valor = Math.min(Math.max(Number(media), 0), 5);

        return `${(valor / 5) * 100}%`;

    }


    //----------------- POSIÇÃO DO PARÂMETRO ------------------//

    function obterPosicaoParametro(parametro) {

        const valor = Math.min(Math.max(Number(parametro), 0), 5);

        return `${(valor / 5) * 100}%`;

    }


    //----------------- TELA DE CARREGAMENTO ------------------//

    if (carregando) {

        return (

            <div className="pagina-acompanhamento-avaliacao">

                <p className="mensagem-acompanhamento">
                    Carregando acompanhamento da avaliação...
                </p>

            </div>

        );

    }


    //----------------- TELA DE ERRO --------------------------//

    if (erro && resultados.length === 0) {

        return (

            <div className="pagina-acompanhamento-avaliacao">

                <p className="erro-acompanhamento">
                    {erro}
                </p>

                <button
                    type="button"
                    className="botao-voltar-acompanhamento"
                    onClick={onVoltar}
                >
                    Voltar
                </button>

            </div>

        );

    }


    //----------------- TELA PRINCIPAL ------------------------//

    return (

        <main className="pagina-acompanhamento-avaliacao">

            {/* CABEÇALHO DA AVALIAÇÃO */}

            <header className="cabecalho-acompanhamento">

                <div className="informacoes-cabecalho-acompanhamento">

                    <h2>
                        Acompanhamento: Avaliação de Fatores
                        Psicossociais — {avaliacao?.titulo}
                    </h2>

                    <p>
                        Acompanhe os resultados dos fatores psicossociais
                        e identifique situações de risco no ambiente de trabalho.
                    </p>

                </div>

                <button
                    type="button"
                    className="botao-encerrar-acompanhamento"
                    disabled
                    title="A funcionalidade de encerramento será integrada posteriormente."
                >
                    <span className="indicador-botao-encerrar"></span>
                    Encerrar Avaliação
                </button>

            </header>


            {/* AVISO DE ATUALIZAÇÃO */}

            {erro && (

                <p className="erro-atualizacao-acompanhamento">
                    Não foi possível atualizar os resultados: {erro}
                </p>

            )}


            {/* LISTA DE FATORES */}

            {resultados.length === 0 ? (

                <p className="mensagem-acompanhamento">
                    Nenhum fator psicossocial encontrado.
                </p>

            ) : (

                <section className="lista-fatores-acompanhamento">

                    {resultados.map((fator) => {

                        const parametro = obterParametro(fator);

                        const classe = obterClasseClassificacao(
                            fator.classificacao
                        );

                        return (

                            <article
                                className="card-fator-acompanhamento"
                                key={fator.id}
                            >

                                {/* CABEÇALHO DO FATOR */}

                                <div className="cabecalho-fator-acompanhamento">

                                    <div className="descricao-fator-acompanhamento">

                                        <h3>
                                            {fator.nome}
                                        </h3>

                                        <p>
                                            {fator.descricao}
                                        </p>

                                    </div>


                                    {/* ÍNDICE CONSOLIDADO */}

                                    <div className={`indicador-fator-acompanhamento ${classe}`}>

                                        <span className="titulo-indice-acompanhamento">
                                            ÍNDICE CONSOLIDADO
                                        </span>

                                        <strong>
                                            {formatarMedia(fator.mediaGeral)}
                                            <small> / 5,0</small>
                                        </strong>

                                        <div className="trilho-indice-acompanhamento">

                                            <div
                                                className="barra-indice-acompanhamento"
                                                style={{
                                                    width: obterLargura(fator.mediaGeral)
                                                }}
                                            />

                                        </div>

                                        <span className={`classificacao-acompanhamento ${classe}`}>
                                            {fator.classificacao}
                                        </span>

                                        <span className="gatilho-indice-acompanhamento">
                                            {obterTextoGatilho(fator)}
                                        </span>

                                    </div>

                                </div>


                                {/* GRÁFICO POR SETOR */}

                                <div className="conteudo-grafico-acompanhamento">

                                    <div className="titulo-grafico-acompanhamento">

                                        <div>

                                            <h4>
                                                Evolução de {fator.nome}
                                            </h4>

                                            <p>
                                                Resultados consolidados por setor
                                                e classificação de risco.
                                            </p>

                                        </div>


                                        {/* LEGENDA */}

                                        <div className="legenda-grafico-acompanhamento">

                                            <span className="legenda-media">
                                                Média do setor
                                            </span>

                                            {parametro !== null && (

                                                <span className="legenda-parametro">
                                                    Limite de Atenção ({formatarMedia(parametro)})
                                                </span>

                                            )}

                                            <span className="legenda-escala">
                                                Faixa Adequada: 1,0 a 5,0
                                            </span>

                                        </div>

                                    </div>


                                    {/* SETORES */}

                                    {fator.setores.length === 0 ? (

                                        <p className="mensagem-setor-acompanhamento">
                                            Ainda não existem setores vinculados
                                            a esta avaliação.
                                        </p>

                                    ) : (

                                        <div className="area-setores-acompanhamento">

                                            {/* MARCADOR VERTICAL DO PARÂMETRO */}

                                            {parametro !== null && (

                                                <div
                                                    className="marcador-parametro-acompanhamento"
                                                    style={{
                                                        left: obterPosicaoParametro(parametro)
                                                    }}
                                                >

                                                    <div className="etiqueta-parametro-acompanhamento">

                                                        <span>
                                                            PARÂMETRO
                                                        </span>

                                                        <strong>
                                                            {formatarMedia(parametro)}
                                                        </strong>

                                                    </div>

                                                </div>

                                            )}


                                            <div className="lista-setores-acompanhamento">

                                                {fator.setores.map((setor) => {

                                                    const classeSetor =
                                                        obterClasseClassificacao(
                                                            setor.classificacao
                                                        );

                                                    const possuiPrioridade =
                                                        classeSetor === 'prioridade';

                                                    return (

                                                        <div
                                                            className={`linha-setor-acompanhamento ${possuiPrioridade ? 'setor-em-prioridade' : ''}`}
                                                            key={setor.idSetor}
                                                        >

                                                            {/* INFORMAÇÕES DO SETOR */}

                                                            <div className="informacoes-setor-acompanhamento">

                                                                <span className="nome-setor-acompanhamento">
                                                                    {setor.nomeSetor}
                                                                </span>

                                                                <div className="resultado-setor-acompanhamento">

                                                                    <strong>
                                                                        {formatarMedia(setor.media)}
                                                                        {' / 5,0'}
                                                                    </strong>

                                                                    <span className={`classificacao-acompanhamento ${classeSetor}`}>
                                                                        {setor.classificacao}
                                                                    </span>

                                                                </div>

                                                            </div>


                                                            {/* BARRA DE RESULTADO */}

                                                            <div className="trilho-grafico-acompanhamento">

                                                                <div
                                                                    className={`barra-grafico-acompanhamento ${classeSetor}`}
                                                                    style={{
                                                                        width: obterLargura(setor.media)
                                                                    }}
                                                                />

                                                            </div>


                                                            {/* AÇÃO DA REGRA */}

                                                            {possuiPrioridade && setor.acao && (

                                                                <div className="acao-setor-acompanhamento">

                                                                    <span className="icone-alerta-acompanhamento">
                                                                        !
                                                                    </span>

                                                                    <p>
                                                                        {setor.acao}
                                                                    </p>

                                                                </div>

                                                            )}

                                                        </div>

                                                    );

                                                })}

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </article>

                        );

                    })}

                </section>

            )}


            {/* RODAPÉ */}

            <footer className="rodape-acompanhamento">

                <button
                    type="button"
                    className="botao-voltar-acompanhamento"
                    onClick={onVoltar}
                >
                    Voltar
                </button>

            </footer>

        </main>

    );

}


//----------------- EXPORTAÇÃO -------------------------------//

export default AcompanhamentoAvaliacao;
