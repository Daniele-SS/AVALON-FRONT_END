//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import buscarParticipacoesAvaliacao from './servico/acompanhamento/buscarParticipacoesAvaliacao.js';
import buscarRespostasAvaliacao from './servico/acompanhamento/buscarRespostasAvaliacao.js';
import buscarFatoresAvaliacao from './servico/acompanhamento/buscarFatoresAvaliacao.js';
import buscarRegrasAvaliacao from './servico/acompanhamento/buscarRegrasAvaliacao.js';

import encerrarAvaliacao from './servico/acompanhamento/encerrarAvaliacao.js';

import agruparRespostas from './funcoes/acompanhamento/agruparRespostas.js';
import calcularMedias from './funcoes/acompanhamento/calcularMedias.js';
import montarResultadosFatores from './funcoes/acompanhamento/montarResultadosFatores.js';

import './css-avaliacaoPsicossocial/acompanhamentoAvaliacao.css';


//----------------- CONFIGURAÇÕES ---------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;
const INTERVALO_ATUALIZACAO = 30000;


//----------------- COMPONENTE PRINCIPAL --------------------//

function AcompanhamentoAvaliacao({ avaliacao, onVoltar }) {

    //----------------- ESTADOS -------------------------------//

    const [resultados, setResultados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [regras, setRegras] = useState([]);

    const [modalEncerrar, setModalEncerrar] = useState(false);
    const [encerrando, setEncerrando] = useState(false);

    const [statusAvaliacao, setStatusAvaliacao] = useState(
        Number(avaliacao?.status ?? 0)
    );


    //----------------- SINCRONIZAR STATUS --------------------//

    useEffect(() => {

        setStatusAvaliacao(
            Number(avaliacao?.status ?? 0)
        );

    }, [avaliacao?.id, avaliacao?.status]);


    //----------------- BUSCAR STATUS NO BACK-END -------------//

    async function atualizarStatusAvaliacao() {

        try {

            const token = localStorage.getItem('access_token');

            const resposta = await fetch(
                `${API}/avaliacao/${avaliacao.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    'Não foi possível consultar o status da avaliação.'
                );
            }

            const dados = await resposta.json();

            /*
             * O backend pode retornar a avaliação diretamente
             * ou dentro de uma propriedade chamada avaliacao.
             */

            const avaliacaoAtualizada =
                dados.response?.avaliacao ||
                dados.DEFAULT_MESSAGE?.response?.avaliacao ||
                dados.data?.response?.avaliacao ||
                dados.avaliacao ||
                dados.data?.avaliacao ||
                dados.data ||
                dados;

            const novoStatus = Number(
                avaliacaoAtualizada.status
            );

            console.log('Avaliação retornada pelo backend:', dados);
            console.log('Status encontrado:', novoStatus);

            if (novoStatus === 0 || novoStatus === 1) {

                setStatusAvaliacao(novoStatus);

            }

        } catch (erro) {

            console.error(
                'Erro ao atualizar status da avaliação:',
                erro
            );

        }

    }


    //----------------- CARREGAR DADOS ------------------------//

    async function carregarAcompanhamento(
        exibirCarregamento = false
    ) {

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

                buscarFatoresAvaliacao(avaliacao.id),

                buscarRegrasAvaliacao(avaliacao.id)

            ]);


            //----------------- GUARDAR REGRAS ------------------//

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

            console.error(
                'Erro ao carregar acompanhamento:',
                erro
            );

            setErro(
                erro.message ||
                'Não foi possível carregar o acompanhamento.'
            );

        } finally {

            if (exibirCarregamento) {
                setCarregando(false);
            }

        }

    }



    //----------------- ENCERRAR AVALIAÇÃO --------------------//

    async function confirmarEncerramento() {

        try {

            setEncerrando(true);
            setErro('');

            /*
             * O serviço só retorna quando o GET confirma
             * que o backend salvou status 1.
             */

            const avaliacaoAtualizada = await encerrarAvaliacao(
                avaliacao
            );

            /*
             * Atualiza o botão somente após a confirmação
             * do status persistido no backend.
             */

            setStatusAvaliacao(
                Number(avaliacaoAtualizada.status)
            );

            setModalEncerrar(false);

        } catch (erro) {

            console.error(
                'Erro ao encerrar avaliação:',
                erro
            );

            setErro(
                erro.message ||
                'Não foi possível encerrar a avaliação.'
            );

        } finally {

            setEncerrando(false);

        }

    }



    //----------------- ATUALIZAÇÃO AUTOMÁTICA ----------------//

    useEffect(() => {

        if (!avaliacao?.id) {
            return;
        }

        let componenteAtivo = true;

        //----------------- PRIMEIRA CONSULTA ------------------//

        async function carregarInicial() {

            await Promise.all([
                carregarAcompanhamento(true),
                atualizarStatusAvaliacao()
            ]);

        }

        carregarInicial();


        //----------------- INTERVALO DE ATUALIZAÇÃO -----------//

        const intervalo = setInterval(async () => {

            /*
             * Atualiza os resultados e consulta o status
             * diretamente no backend.
             */

            if (!componenteAtivo) {
                return;
            }

            await Promise.all([
                carregarAcompanhamento(false),
                atualizarStatusAvaliacao()
            ]);

        }, INTERVALO_ATUALIZACAO);


        //----------------- LIMPAR INTERVALO -------------------//

        return () => {

            componenteAtivo = false;

            clearInterval(intervalo);

        };

    }, [avaliacao?.id]);


    //----------------- PARAR ATUALIZAÇÃO SE ENCERRADA --------//

    useEffect(() => {

        if (statusAvaliacao === 1) {
            setModalEncerrar(false);
        }

    }, [statusAvaliacao]);


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

        if (
            media === null ||
            media === undefined ||
            !Number.isFinite(Number(media))
        ) {
            return '--';
        }

        return Number(media)
            .toFixed(1)
            .replace('.', ',');

    }


    //----------------- BUSCAR REGRAS DO FATOR ----------------//

    function obterRegrasFator(fator) {

        return regras.filter((regra) => {

            return (
                Number(regra.id_psicossocial_fator) ===
                Number(fator.id) &&

                Number(regra.ativo) === 1
            );

        });

    }


    //----------------- BUSCAR REGRA DE ATENÇÃO ---------------//

    function obterRegraAtencao(fator) {

        const regrasFator = obterRegrasFator(fator);

        return regrasFator.find((regra) => {

            const classificacao = String(
                regra.classificacao || ''
            )
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

        const regraReferencia =
            regraAtencao || regrasFator[0];

        const valor = Number(
            regraReferencia.valor_referencial
        );

        return Number.isFinite(valor)
            ? valor
            : null;

    }


    //----------------- TEXTO DO GATILHO ----------------------//

    function obterTextoGatilho(fator) {

        const regra = obterRegraAtencao(fator);

        if (!regra) {
            return 'Parâmetro não definido';
        }

        const valor = formatarMedia(
            regra.valor_referencial
        );

        return `Gatilho de Atenção (${regra.operador} ${valor})`;

    }


    //----------------- LARGURA DA BARRA ----------------------//

    function obterLargura(media) {

        if (
            media === null ||
            media === undefined ||
            !Number.isFinite(Number(media))
        ) {
            return '0%';
        }

        const valor = Math.min(
            Math.max(Number(media), 0),
            5
        );

        return `${(valor / 5) * 100}%`;

    }


    //----------------- POSIÇÃO DO PARÂMETRO ------------------//

    function obterPosicaoParametro(parametro) {

        const valor = Math.min(
            Math.max(Number(parametro), 0),
            5
        );

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


                {/* BOTÃO ENCERRAR */}

                <button
                    type="button"
                    className="botao-encerrar-acompanhamento"
                    onClick={() => setModalEncerrar(true)}
                    disabled={
                        statusAvaliacao === 1 ||
                        encerrando
                    }
                >

                    <span className="indicador-botao-encerrar">
                        ⊗
                    </span>

                    {statusAvaliacao === 1
                        ? 'Avaliação Encerrada'
                        : 'Encerrar Avaliação'}

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

                                    <div
                                        className={`indicador-fator-acompanhamento ${classe}`}
                                    >

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
                                                    width: obterLargura(
                                                        fator.mediaGeral
                                                    )
                                                }}
                                            />

                                        </div>

                                        <span
                                            className={`classificacao-acompanhamento ${classe}`}
                                        >
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
                                                    Limite de Atenção
                                                    ({formatarMedia(parametro)})
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


                                            {/* MARCADOR DO PARÂMETRO */}

                                            {parametro !== null && (

                                                <div
                                                    className="marcador-parametro-acompanhamento"
                                                    style={{
                                                        left: obterPosicaoParametro(
                                                            parametro
                                                        )
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


                                            {/* LISTA DE SETORES */}

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

                                                                    <span
                                                                        className={`classificacao-acompanhamento ${classeSetor}`}
                                                                    >
                                                                        {setor.classificacao}
                                                                    </span>

                                                                </div>

                                                            </div>


                                                            {/* BARRA DE RESULTADO */}

                                                            <div className="trilho-grafico-acompanhamento">

                                                                <div
                                                                    className={`barra-grafico-acompanhamento ${classeSetor}`}
                                                                    style={{
                                                                        width: obterLargura(
                                                                            setor.media
                                                                        )
                                                                    }}
                                                                />

                                                            </div>


                                                            {/* AÇÃO DA REGRA */}

                                                            {possuiPrioridade &&
                                                                setor.acao && (

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


            {/* MODAL DE CONFIRMAÇÃO */}

            {modalEncerrar && (

                <div className="fundo-modal-encerrar-acompanhamento">

                    <section
                        className="card-modal-encerrar-acompanhamento"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-modal-encerrar"
                    >

                        <div className="icone-modal-encerrar">
                            <span>!</span>
                        </div>

                        <h3 id="titulo-modal-encerrar">
                            Deseja realmente encerrar esta avaliação?
                        </h3>

                        <p>
                            Ao encerrar esta avaliação, ela não poderá mais
                            ser continuada pelos participantes. Os dados não
                            receberão novas atualizações e os resultados serão
                            finalizados.
                        </p>

                        <p className="aviso-modal-encerrar">
                            Esta ação não poderá ser desfeita.
                        </p>


                        {/* ERRO DO ENCERRAMENTO */}

                        {erro && (

                            <p className="erro-modal-encerrar">
                                {erro}
                            </p>

                        )}


                        {/* BOTÕES DO MODAL */}

                        <div className="botoes-modal-encerrar">

                            <button
                                type="button"
                                className="botao-cancelar-modal-encerrar"
                                onClick={() => {
                                    setModalEncerrar(false);
                                    setErro('');
                                }}
                                disabled={encerrando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="botao-confirmar-modal-encerrar"
                                onClick={confirmarEncerramento}
                                disabled={encerrando}
                            >
                                {encerrando
                                    ? 'Encerrando...'
                                    : 'Sim, encerrar avaliação'}
                            </button>

                        </div>

                    </section>

                </div>

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