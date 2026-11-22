
import './css-componentes/graficoEvolucao.css';

const LARGURA = 1000;
const ALTURA = 360;

const MARGEM = {
    topo: 24,
    direita: 24,
    baixo: 48,
    esquerda: 48
};

const CORES = [
    '#26A88D',
    '#4D7CFE',
    '#E69A2D',
    '#8B5CF6',
    '#E45D8C',
    '#169BC1',
    '#7A9A35',
    '#D36B36'
];

function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function converterNumero(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    const numero = Number(
        String(valor).replace(',', '.')
    );

    if (!Number.isFinite(numero) || numero < 1 || numero > 5) {
        return null;
    }

    return numero;
}

function obterSatisfacao(item) {
    return converterNumero(
        item.satisfacao ??
        item.satisfacaoGeral ??
        item.mediaGeral ??
        item.media_geral
    );
}

function obterMediaFator(item, fator) {
    const medias = item.medias ?? item.mediasFatores ?? {};

    if (Array.isArray(medias)) {
        const mediaEncontrada = medias.find((media) => {
            const nome = media.nome ?? media.fator ?? media.nomeFator;

            return normalizarTexto(nome) === normalizarTexto(fator);
        });

        return converterNumero(
            mediaEncontrada?.media ??
            mediaEncontrada?.valor ??
            mediaEncontrada?.mediaFator
        );
    }

    const chaveEncontrada = Object.keys(medias).find((chave) => {
        return normalizarTexto(chave) === normalizarTexto(fator);
    });

    if (!chaveEncontrada) {
        return null;
    }

    const valor = medias[chaveEncontrada];

    if (typeof valor === 'object' && valor !== null) {
        return converterNumero(
            valor.media ??
            valor.valor ??
            valor.mediaFator
        );
    }

    return converterNumero(valor);
}

function obterData(item) {
    return (
        item.data ??
        item.data_inicio ??
        item.dataInicio ??
        item.data_fim ??
        item.dataFim ??
        item.mes ??
        ''
    );
}

function formatarData(valor, indice) {
    if (!valor) {
        return `Aval. ${indice + 1}`;
    }

    const texto = String(valor);

    // Data ISO: 2026-11-21 ou 2026-11-21T...
    const dataISO = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (dataISO) {
        return `${dataISO[3]}/${dataISO[2]}`;
    }

    // Data brasileira: 21/11/2026
    const dataBR = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})/);

    if (dataBR) {
        return `${dataBR[1]}/${dataBR[2]}`;
    }

    // Se só houver mês/ano, encurta o nome do mês.
    const meses = [
        'janeiro', 'fevereiro', 'março', 'abril',
        'maio', 'junho', 'julho', 'agosto',
        'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const textoNormalizado = normalizarTexto(texto);

    const mesEncontrado = meses.findIndex((mes) => {
        return textoNormalizado.includes(normalizarTexto(mes));
    });

    if (mesEncontrado >= 0) {
        const ano = texto.match(/\d{4}/)?.[0] ?? '';

        return `${meses[mesEncontrado].slice(0, 3)}/${ano}`;
    }

    return texto;
}

function prepararDados(dados, fatores) {
    if (!Array.isArray(dados)) {
        return [];
    }

    return dados
        .map((item, indiceOriginal) => {
            const satisfacao = obterSatisfacao(item);

            const mediasFatores = fatores.map((fator) => {
                return obterMediaFator(item, fator);
            });

            return {
                ...item,
                indiceOriginal,
                dataOriginal: obterData(item),
                satisfacao,
                mediasFatores
            };
        })
        .filter((item) => {
            const temSatisfacao = item.satisfacao !== null;

            const temAlgumFator = item.mediasFatores.some((media) => {
                return media !== null;
            });

            // Não reserva espaço para avaliações sem médias válidas.
            return temSatisfacao || temAlgumFator;
        })
        .sort((a, b) => {
            const dataA = new Date(a.dataOriginal).getTime();
            const dataB = new Date(b.dataOriginal).getTime();

            if (Number.isFinite(dataA) && Number.isFinite(dataB)) {
                return dataA - dataB;
            }

            return a.indiceOriginal - b.indiceOriginal;
        });
}

function obterPosicaoX(indice, quantidade, larguraUtil) {
    if (quantidade <= 1) {
        return MARGEM.esquerda + larguraUtil / 2;
    }

    return MARGEM.esquerda +
        (indice / (quantidade - 1)) * larguraUtil;
}

function obterPosicaoY(valor, alturaUtil) {
    return MARGEM.topo +
        ((5 - valor) / 4) * alturaUtil;
}

function criarSegmentos(serie, alturaUtil, larguraUtil, quantidade) {
    const segmentos = [];
    let segmentoAtual = [];

    serie.valores.forEach((valor, indice) => {
        if (valor === null) {
            if (segmentoAtual.length > 0) {
                segmentos.push(segmentoAtual);
                segmentoAtual = [];
            }

            return;
        }

        segmentoAtual.push({
            x: obterPosicaoX(indice, quantidade, larguraUtil),
            y: obterPosicaoY(valor, alturaUtil),
            valor,
            indice
        });
    });

    if (segmentoAtual.length > 0) {
        segmentos.push(segmentoAtual);
    }

    return segmentos;
}

function criarCaminho(segmento) {
    return segmento
        .map((ponto, indice) => {
            const comando = indice === 0 ? 'M' : 'L';

            return `${comando} ${ponto.x} ${ponto.y}`;
        })
        .join(' ');
}

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
            Math.round((i / 5) * (quantidade - 1))
        );
    }

    return [...indices];
}

export default function GraficoEvolucao({
    dados = [],
    fatores = [],
    setorSelecionado = 'Todos os setores',
    parametroMinimo = 2.5
}) {
    const dadosValidos = prepararDados(dados, fatores);

    const larguraUtil =
        LARGURA - MARGEM.esquerda - MARGEM.direita;

    const alturaUtil =
        ALTURA - MARGEM.topo - MARGEM.baixo;

    const series = [
        {
            nome: 'Satisfação Geral',
            valores: dadosValidos.map((item) => item.satisfacao)
        },
        ...fatores.map((fator, indice) => ({
            nome: fator,
            valores: dadosValidos.map((item) => {
                return item.mediasFatores[indice];
            })
        }))
    ];

    const seriesValidas = series.filter((serie) => {
        return serie.valores.some((valor) => valor !== null);
    });

    const indicesRotulos = obterIndicesRotulos(dadosValidos.length);

    const datasRotulos = indicesRotulos.map((indice) => {
        const item = dadosValidos[indice];

        return {
            indice,
            data: formatarData(item.dataOriginal, indice)
        };
    });

    return (
        <section className="grafico-evolucao">
            <header className="grafico-evolucao-cabecalho">
                <div>
                    <h2> Evolução dos Indicadores </h2>

                    <p>
                        Acompanhe a evolução das médias nas avaliações.
                    </p>
                </div>

                <span className="grafico-evolucao-setor">
                    {setorSelecionado || 'Todos os setores'}
                </span>
            </header>

            {dadosValidos.length === 0 ? (
                <div className="grafico-evolucao-vazio">
                    Ainda não existem avaliações com dados anônimos
                    suficientes para exibir a evolução.
                </div>
            ) : (
                <>
                    <div className="grafico-evolucao-legenda">
                        {seriesValidas.map((serie, indice) => (
                            <div
                                className="grafico-evolucao-legenda-item"
                                key={serie.nome}
                            >
                                <span
                                    className="grafico-evolucao-legenda-cor"
                                    style={{
                                        backgroundColor: CORES[indice % CORES.length]
                                    }}
                                />

                                <span>{serie.nome}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grafico-evolucao-area">
                        <svg
                            className="grafico-evolucao-svg"
                            viewBox={`0 0 ${LARGURA} ${ALTURA}`}
                            role="img"
                            aria-label="Gráfico de evolução dos indicadores"
                        >
                            {[1, 2, 3, 4, 5].map((valor) => {
                                const y = obterPosicaoY(valor, alturaUtil);

                                return (
                                    <g key={valor}>
                                        <line
                                            className="grafico-evolucao-grade"
                                            x1={MARGEM.esquerda}
                                            x2={LARGURA - MARGEM.direita}
                                            y1={y}
                                            y2={y}
                                        />

                                        <text
                                            className="grafico-evolucao-eixo-y"
                                            x={MARGEM.esquerda - 18}
                                            y={y + 6}
                                            textAnchor="end"
                                        >
                                            {valor}
                                        </text>
                                    </g>
                                );
                            })}

                            <line
                                className="grafico-evolucao-meta"
                                x1={MARGEM.esquerda}
                                x2={LARGURA - MARGEM.direita}
                                y1={obterPosicaoY(parametroMinimo, alturaUtil)}
                                y2={obterPosicaoY(parametroMinimo, alturaUtil)}
                            />

                            {seriesValidas.map((serie, indiceSerie) => {
                                const segmentos = criarSegmentos(
                                    serie,
                                    alturaUtil,
                                    larguraUtil,
                                    dadosValidos.length
                                );

                                const cor = CORES[indiceSerie % CORES.length];

                                return (
                                    <g key={serie.nome}>
                                        {segmentos.map((segmento, indiceSegmento) => (
                                            <path
                                                key={`${serie.nome}-${indiceSegmento}`}
                                                className="grafico-evolucao-linha"
                                                d={criarCaminho(segmento)}
                                                stroke={cor}
                                            />
                                        ))}

                                        {segmentos.flat().map((ponto) => (
                                            <circle
                                                key={`${serie.nome}-${ponto.indice}`}
                                                className="grafico-evolucao-ponto"
                                                cx={ponto.x}
                                                cy={ponto.y}
                                                r="7"
                                                fill={cor}
                                            >
                                                <title>
                                                    {serie.nome}: {ponto.valor.toFixed(1)}
                                                </title>
                                            </circle>
                                        ))}
                                    </g>
                                );
                            })}

                            {datasRotulos.map(({ indice, data }) => {
                                const x = obterPosicaoX(
                                    indice,
                                    dadosValidos.length,
                                    larguraUtil
                                );

                                return (
                                    <text
                                        key={`${indice}-${data}`}
                                        className="grafico-evolucao-eixo-x"
                                        x={x}
                                        y={ALTURA - 16}
                                        textAnchor="middle"
                                    >
                                        {data}
                                    </text>
                                );
                            })}
                        </svg>
                    </div>
                </>
            )}

            <footer className="grafico-evolucao-rodape">
                <div className="grafico-evolucao-parametro">
                    <span />
                    <p>Parâmetro mínimo: {String(parametroMinimo).replace('.', ',')}</p>
                </div>

                <span className="grafico-evolucao-escala">
                    Escala de 1 a 5
                </span>
            </footer>
        </section>
    );
}
