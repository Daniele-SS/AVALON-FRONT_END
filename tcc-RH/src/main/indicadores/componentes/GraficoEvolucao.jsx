
import { useEffect, useRef, useState } from 'react';
import './css-componentes/graficoEvolucao.css';

/* =========================================================
   CONFIGURAÇÕES DO GRÁFICO
========================================================= */

const LARGURA = 1000;
const ALTURA = 390;

const MARGEM = {
    topo: 30,
    direita: 35,
    baixo: 78,
    esquerda: 60
};

/* =========================================================
   FATORES PSICOSSOCIAIS
========================================================= */

const FATORES_GRAFICO = [
    {
        nome: 'Comunicação',
        cor: '#169BC1'
    },
    {
        nome: 'Reconhecimento',
        cor: '#E45D8C'
    },
    {
        nome: 'Carga de Trabalho',
        cor: '#0057D9'
    },
    {
        nome: 'Autonomia',
        cor: '#7A9A35'
    }
];

const MESES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
];

/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function converterNumero(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ''
    ) {
        return null;
    }

    const numero = Number(
        String(valor).replace(',', '.')
    );

    if (
        !Number.isFinite(numero) ||
        numero < 1 ||
        numero > 5
    ) {
        return null;
    }

    return numero;
}

/* =========================================================
   OBTER MÉDIA DO FATOR
========================================================= */

function obterMediaFator(item, nomeFator) {
    const medias =
        item.medias ??
        item.mediasFatores ??
        item.medias_fatores ??
        {};

    /* Caso as médias venham como um array */

    if (Array.isArray(medias)) {
        const mediaEncontrada = medias.find(media => {
            const nome =
                media.nome ??
                media.fator ??
                media.nomeFator;

            return (
                normalizarTexto(nome) ===
                normalizarTexto(nomeFator)
            );
        });

        return converterNumero(
            mediaEncontrada?.media ??
            mediaEncontrada?.valor ??
            mediaEncontrada?.mediaFator
        );
    }

    /* Caso as médias venham como um objeto */

    const chaveEncontrada = Object.keys(medias).find(
        chave =>
            normalizarTexto(chave) ===
            normalizarTexto(nomeFator)
    );

    if (!chaveEncontrada) {
        return null;
    }

    const valor = medias[chaveEncontrada];

    if (
        typeof valor === 'object' &&
        valor !== null
    ) {
        return converterNumero(
            valor.media ??
            valor.valor ??
            valor.mediaFator
        );
    }

    return converterNumero(valor);
}

/* =========================================================
   OBTER CHAVE DO MÊS
========================================================= */

function obterChaveMes(item) {
    if (item.chaveMes) {
        return String(item.chaveMes);
    }

    if (
        item.id &&
        /^\d{4}-\d{2}$/.test(String(item.id))
    ) {
        return String(item.id);
    }

    const data =
        item.data ??
        item.data_inicio ??
        item.dataInicio ??
        item.data_fim ??
        item.dataFim ??
        '';

    const texto = String(data);

    /* Data no formato YYYY-MM-DD */

    const dataISO = texto.match(
        /^(\d{4})-(\d{2})/
    );

    if (dataISO) {
        return `${dataISO[1]}-${dataISO[2]}`;
    }

    /* Mês por extenso com ano */

    const mesTexto = String(item.mes ?? '');
    const mesNormalizado = normalizarTexto(mesTexto);

    const indiceMes = MESES.findIndex(
        mes =>
            mesNormalizado.includes(
                normalizarTexto(mes)
            )
    );

    const anoEncontrado = mesTexto.match(/\d{4}/);

    if (
        indiceMes >= 0 &&
        anoEncontrado
    ) {
        return `${anoEncontrado[0]}-${String(
            indiceMes + 1
        ).padStart(2, '0')}`;
    }

    return '';
}

/* =========================================================
   OBTER RÓTULO DO MÊS
========================================================= */

function obterRotuloMes(item, indice) {
    const chaveMes = obterChaveMes(item);

    if (chaveMes) {
        const [ano, mes] = chaveMes
            .split('-')
            .map(Number);

        if (
            Number.isFinite(ano) &&
            mes >= 1 &&
            mes <= 12
        ) {
            return {
                mes: MESES[mes - 1],
                ano: String(ano)
            };
        }
    }

    const texto = String(item.mes ?? '');
    const textoNormalizado = normalizarTexto(texto);

    const indiceMes = MESES.findIndex(
        mes =>
            textoNormalizado.includes(
                normalizarTexto(mes)
            )
    );

    if (indiceMes >= 0) {
        return {
            mes: MESES[indiceMes],
            ano: texto.match(/\d{4}/)?.[0] ?? ''
        };
    }

    return {
        mes: texto || `Mês ${indice + 1}`,
        ano: ''
    };
}

/* =========================================================
   PREPARAR DADOS DO GRÁFICO
========================================================= */

function prepararDados(dados, fatores) {
    if (!Array.isArray(dados)) {
        return [];
    }

    const fatoresDisponiveis =
        Array.isArray(fatores) ? fatores : [];

    return dados
        .map((item, indiceOriginal) => {
            const mediasFatores =
                FATORES_GRAFICO.map(fator => {
                    const nomeDisponivel =
                        fatoresDisponiveis.find(nome =>
                            normalizarTexto(nome) ===
                            normalizarTexto(fator.nome)
                        );

                    return obterMediaFator(
                        item,
                        nomeDisponivel || fator.nome
                    );
                });

            return {
                ...item,
                indiceOriginal,
                chaveMes: obterChaveMes(item),
                rotuloMes: obterRotuloMes(
                    item,
                    indiceOriginal
                ),
                mediasFatores
            };
        })
        .filter(item =>
            item.mediasFatores.some(
                media => media !== null
            )
        )
        .sort((a, b) => {
            if (a.chaveMes && b.chaveMes) {
                return a.chaveMes.localeCompare(
                    b.chaveMes
                );
            }

            return (
                a.indiceOriginal -
                b.indiceOriginal
            );
        });
}

/* =========================================================
   POSIÇÕES DOS PONTOS
========================================================= */

function obterPosicaoX(
    indice,
    quantidade,
    larguraUtil
) {
    if (quantidade <= 1) {
        return (
            MARGEM.esquerda +
            larguraUtil / 2
        );
    }

    return (
        MARGEM.esquerda +
        (indice / (quantidade - 1)) *
        larguraUtil
    );
}

function obterPosicaoY(valor, alturaUtil) {
    return (
        MARGEM.topo +
        ((5 - valor) / 4) *
        alturaUtil
    );
}

/* =========================================================
   CRIAR CAMINHO DAS LINHAS
========================================================= */

function criarCaminho(
    serie,
    alturaUtil,
    larguraUtil,
    quantidade
) {
    const pontos = serie.valores.map(
        (valor, indice) => {
            if (valor === null) {
                return null;
            }

            return {
                x: obterPosicaoX(
                    indice,
                    quantidade,
                    larguraUtil
                ),
                y: obterPosicaoY(
                    valor,
                    alturaUtil
                ),
                valor,
                indice
            };
        }
    );

    const segmentos = [];
    let segmentoAtual = [];

    pontos.forEach(ponto => {
        if (!ponto) {
            if (segmentoAtual.length > 0) {
                segmentos.push(segmentoAtual);
                segmentoAtual = [];
            }

            return;
        }

        segmentoAtual.push(ponto);
    });

    if (segmentoAtual.length > 0) {
        segmentos.push(segmentoAtual);
    }

    return segmentos;
}

function converterSegmentoEmCaminho(segmento) {
    return segmento
        .map((ponto, indice) => {
            const comando =
                indice === 0 ? 'M' : 'L';

            return `${comando} ${ponto.x} ${ponto.y}`;
        })
        .join(' ');
}

/* =========================================================
   RÓTULOS DO EIXO X
========================================================= */

function obterIndicesRotulos(quantidade) {
    if (quantidade <= 6) {
        return Array.from(
            { length: quantidade },
            (_, indice) => indice
        );
    }

    const indices = new Set();

    for (let i = 0; i < 6; i++) {
        indices.add(
            Math.round(
                (i / 5) * (quantidade - 1)
            )
        );
    }

    return [...indices];
}

/* =========================================================
   POSIÇÃO DO TOOLTIP
========================================================= */

function obterPosicaoTooltip(ponto) {
    const larguraTooltip = 195;
    const alturaTooltip = 100;

    let x = ponto.x + 14;
    let y = ponto.y - alturaTooltip - 12;

    if (x + larguraTooltip > LARGURA - 5) {
        x = ponto.x - larguraTooltip - 14;
    }

    if (y < 5) {
        y = ponto.y + 14;
    }

    if (y + alturaTooltip > ALTURA - 5) {
        y = ALTURA - alturaTooltip - 5;
    }

    return { x, y };
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function GraficoEvolucao({
    dados = [],
    fatores = [],
    setorSelecionado = 'Todos os setores',
    parametroMinimo = 2.5
}) {
    /*
     * Referência usada para detectar quando o gráfico
     * entra na área visível da página.
     */
    const graficoRef = useRef(null);

    /*
     * A animação começa desativada e é ativada
     * somente quando o gráfico aparece na tela.
     */
    const [animacaoIniciada, setAnimacaoIniciada] =
        useState(false);

    /* =====================================================
       ANIMAÇÃO AO ENTRAR NA TELA
    ===================================================== */

    useEffect(() => {
        const elemento = graficoRef.current;

        if (!elemento || animacaoIniciada) {
            return;
        }

        /*
         * Se o navegador não suportar IntersectionObserver,
         * ativa a animação normalmente.
         */
        if (!('IntersectionObserver' in window)) {
            setAnimacaoIniciada(true);
            return;
        }

        const observador = new IntersectionObserver(
            entradas => {
                const graficoVisivel = entradas.some(
                    entrada => entrada.isIntersecting
                );

                if (graficoVisivel) {
                    setAnimacaoIniciada(true);

                    /*
                     * Desconecta o observador depois da primeira
                     * entrada na tela para não repetir a animação.
                     */
                    observador.disconnect();
                }
            },
            {
                threshold: 0.05,
                rootMargin: '0px 0px -5% 0px'
            }
        );

        observador.observe(elemento);

        return () => {
            observador.disconnect();
        };
    }, [animacaoIniciada]);

    /* =====================================================
       DADOS E DIMENSÕES
    ===================================================== */

    const dadosValidos = prepararDados(
        dados,
        fatores
    );

    const larguraUtil =
        LARGURA -
        MARGEM.esquerda -
        MARGEM.direita;

    const alturaUtil =
        ALTURA -
        MARGEM.topo -
        MARGEM.baixo;

    const series = FATORES_GRAFICO.map(
        (fator, indiceFator) => ({
            ...fator,
            valores: dadosValidos.map(item =>
                item.mediasFatores[indiceFator]
            )
        })
    );

    const seriesValidas = series.filter(
        serie =>
            serie.valores.some(
                valor => valor !== null
            )
    );

    const indicesRotulos = obterIndicesRotulos(
        dadosValidos.length
    );

    const posicaoParametro = obterPosicaoY(
        parametroMinimo,
        alturaUtil
    );

    /* =====================================================
       RENDERIZAÇÃO
    ===================================================== */

    return (
        <section
            ref={graficoRef}
            className="grafico-evolucao"
        >
            {/* CABEÇALHO */}

            <header className="grafico-evolucao-cabecalho">
                <div>
                    <span className="grafico-evolucao-subtitulo">
                        HISTÓRICO
                    </span>

                    <h2>
                        Evolução Mensal dos Fatores Psicossociais
                    </h2>

                    <p>
                        Acompanhe a evolução mensal dos fatores
                        psicossociais com base nas avaliações
                        encerradas.
                    </p>
                </div>

                <span className="grafico-evolucao-setor">
                    {setorSelecionado ||
                        'Todos os setores'}
                </span>
            </header>

            {/* LEGENDA DOS FATORES */}

            <div className="grafico-evolucao-legenda">
                {FATORES_GRAFICO.map(fator => (
                    <div
                        className="grafico-evolucao-legenda-item"
                        key={fator.nome}
                    >
                        <span
                            className="grafico-evolucao-legenda-cor"
                            style={{
                                backgroundColor: fator.cor
                            }}
                        />

                        <span>
                            {fator.nome}
                        </span>
                    </div>
                ))}
            </div>

            {/* GRÁFICO */}

            {dadosValidos.length === 0 ? (
                <div className="grafico-evolucao-vazio">
                    Ainda não existem respostas válidas
                    para apresentar a evolução dos
                    indicadores.
                </div>
            ) : (
                <div className="grafico-evolucao-area">
                    <svg
                        className={`grafico-evolucao-svg ${
                            animacaoIniciada
                                ? 'grafico-evolucao-animar'
                                : ''
                        }`}
                        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
                        role="img"
                        aria-label="Evolução mensal dos fatores psicossociais"
                    >
                        {/* GRADE E ESCALA VERTICAL */}

                        {[1, 2, 3, 4, 5].map(valor => {
                            const y = obterPosicaoY(
                                valor,
                                alturaUtil
                            );

                            return (
                                <g key={valor}>
                                    <line
                                        className="grafico-evolucao-grade"
                                        x1={MARGEM.esquerda}
                                        x2={
                                            LARGURA -
                                            MARGEM.direita
                                        }
                                        y1={y}
                                        y2={y}
                                    />

                                    <text
                                        className="grafico-evolucao-eixo-y"
                                        x={
                                            MARGEM.esquerda -
                                            15
                                        }
                                        y={y + 5}
                                        textAnchor="end"
                                    >
                                        {valor.toFixed(1)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* EIXO VERTICAL */}

                        <line
                            className="grafico-evolucao-eixo"
                            x1={MARGEM.esquerda}
                            y1={MARGEM.topo}
                            x2={MARGEM.esquerda}
                            y2={
                                ALTURA -
                                MARGEM.baixo
                            }
                        />

                        {/* EIXO HORIZONTAL */}

                        <line
                            className="grafico-evolucao-eixo"
                            x1={MARGEM.esquerda}
                            y1={
                                ALTURA -
                                MARGEM.baixo
                            }
                            x2={
                                LARGURA -
                                MARGEM.direita
                            }
                            y2={
                                ALTURA -
                                MARGEM.baixo
                            }
                        />

                        {/* PARÂMETRO MÍNIMO DA MÉDIA */}

                        <line
                            className="grafico-evolucao-meta"
                            x1={MARGEM.esquerda}
                            x2={
                                LARGURA -
                                MARGEM.direita
                            }
                            y1={posicaoParametro}
                            y2={posicaoParametro}
                        />

                        {/* RÓTULO DO PARÂMETRO */}

                        <g className="grafico-evolucao-meta-rotulo">
                            <rect
                                className="grafico-evolucao-meta-fundo"
                                x={LARGURA / 2 - 100}
                                y={posicaoParametro - 12}
                                width="200"
                                height="24"
                                rx="3"
                            />

                            <text
                                className="grafico-evolucao-meta-texto"
                                x={LARGURA / 2}
                                y={posicaoParametro + 4}
                                textAnchor="middle"
                            >
                                {`PARÂMETRO MÍNIMO (${String(
                                    parametroMinimo
                                ).replace('.', ',')})`}
                            </text>
                        </g>

                        {/* LINHAS E PONTOS DOS FATORES */}

                        {seriesValidas.map(serie => {
                            const segmentos = criarCaminho(
                                serie,
                                alturaUtil,
                                larguraUtil,
                                dadosValidos.length
                            );

                            return (
                                <g key={serie.nome}>
                                    {/* LINHAS */}

                                    {segmentos.map(
                                        (
                                            segmento,
                                            indiceSegmento
                                        ) => (
                                            <path
                                                key={`${serie.nome}-${indiceSegmento}`}
                                                className="grafico-evolucao-linha"
                                                d={converterSegmentoEmCaminho(
                                                    segmento
                                                )}
                                                stroke={serie.cor}
                                                pathLength="1"
                                            />
                                        )
                                    )}

                                    {/* PONTOS COM TOOLTIP */}

                                    {segmentos
                                        .flat()
                                        .map(ponto => {
                                            const item =
                                                dadosValidos[
                                                    ponto.indice
                                                ];

                                            const rotulo =
                                                item.rotuloMes;

                                            const posicaoTooltip =
                                                obterPosicaoTooltip(
                                                    ponto
                                                );

                                            return (
                                                <g
                                                    key={`${serie.nome}-${ponto.indice}`}
                                                    className="grafico-evolucao-ponto-grupo"
                                                >
                                                    <circle
                                                        className="grafico-evolucao-ponto"
                                                        cx={ponto.x}
                                                        cy={ponto.y}
                                                        r="6"
                                                        fill={serie.cor}
                                                        style={{
                                                            animationDelay:
                                                                `${ponto.indice * 100}ms`
                                                        }}
                                                    />

                                                    <foreignObject
                                                        className="grafico-evolucao-tooltip-container"
                                                        x={posicaoTooltip.x}
                                                        y={posicaoTooltip.y}
                                                        width="195"
                                                        height="100"
                                                    >
                                                        <div
                                                            xmlns="http://www.w3.org/1999/xhtml"
                                                            className="grafico-evolucao-tooltip"
                                                        >
                                                            <strong className="grafico-evolucao-tooltip-titulo">
                                                                {serie.nome}
                                                            </strong>

                                                            <span className="grafico-evolucao-tooltip-periodo">
                                                                {rotulo.mes}{' '}
                                                                {rotulo.ano}
                                                            </span>

                                                            <div className="grafico-evolucao-tooltip-valor">
                                                                <span>
                                                                    Média
                                                                </span>

                                                                <strong>
                                                                    {ponto.valor
                                                                        .toFixed(1)
                                                                        .replace(
                                                                            '.',
                                                                            ','
                                                                        )}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    </foreignObject>
                                                </g>
                                            );
                                        })}
                                </g>
                            );
                        })}

                        {/* MESES E ANOS NO EIXO X */}

                        {indicesRotulos.map(indice => {
                            const x = obterPosicaoX(
                                indice,
                                dadosValidos.length,
                                larguraUtil
                            );

                            const rotulo =
                                dadosValidos[indice].rotuloMes;

                            return (
                                <text
                                    key={`${indice}-${rotulo.mes}-${rotulo.ano}`}
                                    className="grafico-evolucao-eixo-x"
                                    x={x}
                                    y={ALTURA - 42}
                                    textAnchor="middle"
                                >
                                    <tspan x={x} dy="0">
                                        {rotulo.mes}
                                    </tspan>

                                    {rotulo.ano && (
                                        <tspan
                                            className="grafico-evolucao-ano"
                                            x={x}
                                            dy="19"
                                        >
                                            {rotulo.ano}
                                        </tspan>
                                    )}
                                </text>
                            );
                        })}
                    </svg>
                </div>
            )}

            {/* RODAPÉ */}

            <footer className="grafico-evolucao-rodape">
                <div className="grafico-evolucao-parametro">
                    <span />

                    <p>
                        Parâmetro mínimo:{' '}
                        {String(parametroMinimo).replace(
                            '.',
                            ','
                        )}
                    </p>
                </div>

                <span className="grafico-evolucao-escala">
                    Escala de 1 a 5
                </span>

                <p className="grafico-evolucao-consolidacao">
                    Quantidade mínima para consolidação:{' '}
                    <strong>1 participante válido</strong>
                </p>
            </footer>
        </section>
    );
}
