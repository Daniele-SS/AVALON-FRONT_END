
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


//----------------- COMPONENTE PRINCIPAL ---------------------//

function AcompanhamentoAvaliacao({ avaliacao, onVoltar }) {

    //----------------- ESTADOS -------------------------------//

    const [resultados, setResultados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [regras, setRegras] = useState([]);


    //----------------- CARREGAR DADOS ------------------------//

    async function carregarAcompanhamento() {

        try {

            setCarregando(true);
            setErro('');

            // Busca os dados da avaliação e seus parâmetros vinculados.
            const [
                participacoes,
                respostas,
                fatores,
                regrasVinculadas
            ] = await Promise.all([

                buscarParticipacoesAvaliacao(avaliacao.id),
                buscarRespostasAvaliacao(avaliacao.id),
                buscarFatoresAvaliacao(),
                buscarRegrasAvaliacao(avaliacao.id)

            ]);

            setRegras(regrasVinculadas);

            // Relaciona respostas, participações e setores.
            const dadosAgrupados = agruparRespostas(
                participacoes,
                respostas
            );

            // Calcula as médias dos fatores.
            const medias = calcularMedias(
                dadosAgrupados.respostasValidas,
                fatores,
                dadosAgrupados.setoresAvaliacao,
                1
            );

            // Monta os resultados usando somente as regras vinculadas.
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

            setCarregando(false);

        }

    }


    //----------------- CARREGAMENTO INICIAL ------------------//

    useEffect(() => {

        if (avaliacao?.id) {
            carregarAcompanhamento();
        }

    }, [avaliacao?.id]);


    //----------------- CLASSIFICAÇÃO VISUAL ------------------//

    function obterClasseClassificacao(classificacao) {

        const valor = String(classificacao || '').toUpperCase();

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


    //----------------- PARÂMETRO DAS REGRAS ------------------//

    function obterParametro(fator) {

        // Busca as regras vinculadas ao fator atual.
        const regrasFator = regras.filter((regra) => {

            return (
                Number(regra.id_psicossocial_fator) === Number(fator.id)
            );

        });

        if (regrasFator.length === 0) {
            return null;
        }

        // Se houver uma regra de Atenção ou Prioridade,
        // utiliza seu valor como referência visual.
        const regraLimite = regrasFator.find((regra) => {

            const classificacao = String(regra.classificacao || '')
                .trim()
                .toUpperCase();

            return (
                classificacao === 'ATENÇÃO' ||
                classificacao === 'ATENCAO' ||
                classificacao === 'PRIORIDADE'
            );

        });

        // Se houver somente uma regra, utiliza seu valor.
        // Isso permite exibir o parâmetro do exemplo > 2.50.
        const regraReferencia = regraLimite || regrasFator[0];

        return Number(regraReferencia.valor_referencial);

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

    if (erro) {

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

        <div className="pagina-acompanhamento-avaliacao">

            {/* CABEÇALHO */}

            <header className="cabecalho-acompanhamento">

                <div className="informacoes-cabecalho-acompanhamento">

                    <h2>
                        Acompanhamento: Avaliação de Fatores
                        Psicossociais — {avaliacao?.titulo}
                    </h2>

                    <p>
                        Acompanhe os resultados dos fatores psicossociais
                        e identifique situações que necessitam de atenção
                        no ambiente de trabalho.
                    </p>

                </div>

                <button
                    type="button"
                    className="botao-encerrar-acompanhamento"
                    disabled
                    title="A integração para encerrar a avaliação será adicionada após confirmar a rota de atualização."
                >
                    Encerrar Avaliação
                </button>

            </header>


            {/* RESULTADOS DOS FATORES */}

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

                                {/* IDENTIFICAÇÃO DO FATOR */}

                                <div className="cabecalho-fator-acompanhamento">

                                    <div className="descricao-fator-acompanhamento">

                                        <h3>
                                            {fator.nome}
                                        </h3>

                                        <p>
                                            {fator.descricao}
                                        </p>

                                    </div>


                                    {/* MÉDIA GERAL */}

                                    <div className="indicador-fator-acompanhamento">

                                        <span>
                                            ÍNDICE CONSOLIDADO
                                        </span>

                                        <strong>
                                            {formatarMedia(fator.mediaGeral)}
                                            <small> / 5,0</small>
                                        </strong>

                                        <span className={`classificacao-acompanhamento ${classe}`}>
                                            {fator.classificacao}
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

                                        <div className="legenda-grafico-acompanhamento">

                                            <span className="legenda-media">
                                                Média do setor
                                            </span>

                                            {parametro !== null && (

                                                <span className="legenda-parametro">
                                                    Parâmetro ({formatarMedia(parametro)})
                                                </span>

                                            )}

                                            <span className="legenda-escala">
                                                Escala de 1,0 a 5,0
                                            </span>

                                        </div>

                                    </div>


                                    {fator.setores.length === 0 ? (

                                        <p className="mensagem-setor-acompanhamento">
                                            Ainda não existem setores vinculados
                                            a esta avaliação.
                                        </p>

                                    ) : (

                                        <div className="lista-setores-acompanhamento">

                                            {fator.setores.map((setor) => {

                                                const classeSetor =
                                                    obterClasseClassificacao(
                                                        setor.classificacao
                                                    );

                                                const largura = setor.media !== null
                                                    ? `${(setor.media / 5) * 100}%`
                                                    : '0%';

                                                return (

                                                    <div
                                                        className="linha-setor-acompanhamento"
                                                        key={setor.idSetor}
                                                    >

                                                        <div className="informacoes-setor-acompanhamento">

                                                            <span className="nome-setor-acompanhamento">
                                                                {setor.nomeSetor}
                                                            </span>

                                                            {setor.semRespostas ? (

                                                                <div className="resultado-setor-acompanhamento">

                                                                    <strong>
                                                                        {formatarMedia(setor.media)}
                                                                        {' / 5,0'}
                                                                    </strong>

                                                                    <span className="classificacao-acompanhamento indisponivel">
                                                                        Sem respostas
                                                                    </span>

                                                                </div>

                                                            ) : setor.disponivel ? (

                                                                <div className="resultado-setor-acompanhamento">

                                                                    <strong>
                                                                        {formatarMedia(setor.media)}
                                                                        {' / 5,0'}
                                                                    </strong>

                                                                    <span className={`classificacao-acompanhamento ${classeSetor}`}>
                                                                        {setor.classificacao}
                                                                    </span>

                                                                </div>

                                                            ) : (

                                                                <span className="dados-ocultos-acompanhamento">
                                                                    Dados indisponíveis
                                                                </span>

                                                            )}

                                                        </div>


                                                        {/* BARRA DE MÉDIA */}

                                                        <div className="trilho-grafico-acompanhamento">

                                                            <div
                                                                className={`barra-grafico-acompanhamento ${classeSetor}`}
                                                                style={{
                                                                    width: largura
                                                                }}
                                                            />

                                                            {/* MARCADOR DO PARÂMETRO */}

                                                            {parametro !== null && (

                                                                <div
                                                                    className="linha-parametro-acompanhamento"
                                                                    style={{
                                                                        left: `${(parametro / 5) * 100}%`
                                                                    }}
                                                                />

                                                            )}

                                                        </div>

                                                    </div>

                                                );

                                            })}

                                        </div>

                                    )}

                                </div>

                            </article>

                        );

                    })}

                </section>

            )}


            {/* BOTÃO VOLTAR */}

            <div className="rodape-acompanhamento">

                <button
                    type="button"
                    className="botao-voltar-acompanhamento"
                    onClick={onVoltar}
                >
                    Voltar
                </button>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO -------------------------------//

export default AcompanhamentoAvaliacao;
