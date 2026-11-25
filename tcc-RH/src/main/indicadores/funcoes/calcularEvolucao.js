
/********************************************************************************
 * Objetivo:
 * Montar os dados históricos dos indicadores por mês.
 *
 * Regras:
 * - Considera avaliações em andamento e encerradas.
 * - Ignora avaliações canceladas.
 * - Agrupa várias avaliações do mesmo mês.
 * - Calcula a média mensal de cada fator psicossocial.
 * - Considera somente respostas válidas entre 1 e 5.
 * - Considera pelo menos 1 participante distinto.
 * - Respeita o filtro de setor.
 ********************************************************************************/

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;

/* =========================================================
   DATAS
========================================================= */

/**
 * Converte uma data para Date sem deslocar datas
 * que chegam no formato YYYY-MM-DD.
 */
function converterData(data) {
    if (!data) {
        return null;
    }

    if (data instanceof Date) {
        return Number.isNaN(data.getTime()) ? null : data;
    }

    const texto = String(data);

    const dataSomente = texto.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (dataSomente) {
        return new Date(
            Number(dataSomente[1]),
            Number(dataSomente[2]) - 1,
            Number(dataSomente[3])
        );
    }

    const dataConvertida = new Date(data);

    return Number.isNaN(dataConvertida.getTime())
        ? null
        : dataConvertida;
}

/**
 * Obtém a data principal da avaliação.
 */
function obterDataAvaliacao(avaliacao) {
    return (
        avaliacao.data_fim ||
        avaliacao.data_final ||
        avaliacao.data_inicio ||
        avaliacao.data ||
        avaliacao.created_at ||
        ''
    );
}

/**
 * Obtém a data em que a resposta foi registrada.
 *
 * Se a resposta não possuir data, utiliza a data
 * da avaliação como referência.
 */
function obterDataResposta(resposta, avaliacao) {
    return (
        resposta.data_resposta ||
        resposta.data_criacao ||
        resposta.created_at ||
        resposta.createdAt ||
        resposta.data ||
        obterDataAvaliacao(avaliacao)
    );
}

/**
 * Cria uma chave para agrupar os dados por mês.
 *
 * Exemplo:
 * 2026-10
 */
function obterChaveMes(data) {
    const dataConvertida = converterData(data);

    if (!dataConvertida) {
        return '';
    }

    const ano = dataConvertida.getFullYear();

    const mes = String(
        dataConvertida.getMonth() + 1
    ).padStart(2, '0');

    return `${ano}-${mes}`;
}

/**
 * Formata o mês para aparecer no gráfico.
 *
 * Exemplo:
 * Outubro 2026
 */
function formatarMes(chaveMes) {
    if (!chaveMes) {
        return '';
    }

    const [ano, mes] = chaveMes.split('-').map(Number);

    const data = new Date(ano, mes - 1, 1);

    const nomeMes = data.toLocaleDateString(
        'pt-BR',
        { month: 'long' }
    );

    return (
        nomeMes.charAt(0).toUpperCase() +
        nomeMes.slice(1) +
        ` ${ano}`
    );
}

/* =========================================================
   AVALIAÇÕES
========================================================= */

/**
 * Obtém o status da avaliação.
 */
function obterStatusAvaliacao(avaliacao) {
    return (
        avaliacao.status?.nome ||
        avaliacao.status?.descricao ||
        avaliacao.status ||
        avaliacao.situacao?.nome ||
        avaliacao.situacao ||
        avaliacao.estado?.nome ||
        avaliacao.estado ||
        ''
    );
}

/**
 * Verifica se a avaliação foi cancelada.
 *
 * Avaliações em andamento e encerradas são aceitas.
 */
function avaliacaoFoiCancelada(avaliacao) {
    const status = String(
        obterStatusAvaliacao(avaliacao)
    )
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    return (
        status.includes('cancelad') ||
        status.includes('excluid') ||
        status.includes('apagada')
    );
}

/* =========================================================
   PARTICIPAÇÕES
========================================================= */

/**
 * Obtém o ID da avaliação vinculada à participação.
 */
function obterIdAvaliacao(participacao) {
    return Number(
        participacao.id_avaliacao ??
        participacao.avaliacao?.id
    );
}

/**
 * Obtém o ID do colaborador.
 */
function obterIdColaborador(participacao) {
    const colaborador = Array.isArray(
        participacao.colaborador
    )
        ? participacao.colaborador[0]
        : participacao.colaborador;

    return Number(
        colaborador?.id ??
        colaborador?.id_colaborador ??
        participacao.id_colaborador
    );
}

/**
 * Obtém o setor do colaborador.
 */
function obterSetorColaborador(participacao) {
    const colaborador = Array.isArray(
        participacao.colaborador
    )
        ? participacao.colaborador[0]
        : participacao.colaborador;

    return Array.isArray(colaborador?.setor)
        ? colaborador.setor[0]
        : colaborador?.setor;
}

/**
 * Obtém o ID do setor da participação.
 */
function obterIdSetor(participacao) {
    const colaborador = Array.isArray(
        participacao.colaborador
    )
        ? participacao.colaborador[0]
        : participacao.colaborador;

    const setor = obterSetorColaborador(participacao);

    return Number(
        colaborador?.id_setor ??
        setor?.id ??
        participacao.id_setor ??
        participacao.setor?.id
    );
}

/* =========================================================
   RESPOSTAS
========================================================= */

/**
 * Obtém o ID da participação vinculada à resposta.
 */
function obterIdParticipacaoResposta(resposta) {
    return Number(
        resposta.id_avaliacao_participacao ??
        resposta.avaliacao_participacao?.id
    );
}

/**
 * Calcula a média de valores válidos.
 */
function calcularMedia(valores) {
    if (!valores.length) {
        return null;
    }

    const soma = valores.reduce(
        (total, valor) => total + valor,
        0
    );

    return Number(
        (soma / valores.length).toFixed(1)
    );
}

/**
 * Obtém o valor válido da resposta.
 */
function obterValorResposta(resposta) {
    const valor = Number(
        String(resposta.valor ?? '').replace(',', '.')
    );

    if (
        !Number.isFinite(valor) ||
        valor < 1 ||
        valor > 5
    ) {
        return null;
    }

    return valor;
}

/* =========================================================
   CÁLCULO DA EVOLUÇÃO
========================================================= */

/**
 * Parâmetros:
 *
 * avaliacoes:
 * Lista de avaliações cadastradas.
 *
 * participacoes:
 * Lista de participações das avaliações.
 *
 * respostas:
 * Lista de respostas dos colaboradores.
 *
 * fatores:
 * Array de fatores com id e nome.
 *
 * idSetor:
 * null = todos os setores.
 * número = somente o setor informado.
 */
export function calcularEvolucao({
    avaliacoes = [],
    participacoes = [],
    respostas = [],
    fatores = [],
    idSetor = null,
    quantidadeMinima = QUANTIDADE_MINIMA_PARTICIPANTES
}) {
    /* =====================================================
       AVALIAÇÕES VÁLIDAS
    ===================================================== */

    const avaliacoesValidas = avaliacoes.filter(
        avaliacao =>
            !avaliacaoFoiCancelada(avaliacao)
    );

    const idsAvaliacoesValidas = new Set(
        avaliacoesValidas.map(
            avaliacao => Number(avaliacao.id)
        )
    );

    /* =====================================================
       MAPEAR AVALIAÇÕES
    ===================================================== */

    const mapaAvaliacoes = new Map();

    avaliacoesValidas.forEach(avaliacao => {
        mapaAvaliacoes.set(
            Number(avaliacao.id),
            avaliacao
        );
    });

    /* =====================================================
       MAPEAR PARTICIPAÇÕES
    ===================================================== */

    const participacoesValidas = participacoes.filter(
        participacao => {
            const idAvaliacao =
                obterIdAvaliacao(participacao);

            if (!idsAvaliacoesValidas.has(idAvaliacao)) {
                return false;
            }

            if (
                idSetor !== null &&
                idSetor !== undefined &&
                obterIdSetor(participacao) !== Number(idSetor)
            ) {
                return false;
            }

            const idColaborador =
                obterIdColaborador(participacao);

            return (
                Number.isFinite(idColaborador) &&
                idColaborador > 0
            );
        }
    );

    const mapaParticipacoes = new Map();

    participacoesValidas.forEach(participacao => {
        mapaParticipacoes.set(
            Number(participacao.id),
            participacao
        );
    });

    /* =====================================================
       AGRUPAR RESPOSTAS POR MÊS
    ===================================================== */

    const mapaMensal = new Map();

    respostas.forEach(resposta => {
        const idParticipacao =
            obterIdParticipacaoResposta(resposta);

        const participacao =
            mapaParticipacoes.get(idParticipacao);

        if (!participacao) {
            return;
        }

        const idAvaliacao =
            obterIdAvaliacao(participacao);

        const avaliacao =
            mapaAvaliacoes.get(idAvaliacao);

        if (!avaliacao) {
            return;
        }

        const valor = obterValorResposta(resposta);

        if (valor === null) {
            return;
        }

        const dataResposta = obterDataResposta(
            resposta,
            avaliacao
        );

        const chaveMes = obterChaveMes(dataResposta);

        if (!chaveMes) {
            return;
        }

        if (!mapaMensal.has(chaveMes)) {
            mapaMensal.set(chaveMes, {
                valoresGerais: [],
                participantes: new Set(),
                fatores: {}
            });
        }

        const dadosMes = mapaMensal.get(chaveMes);

        const idColaborador =
            obterIdColaborador(participacao);

        dadosMes.participantes.add(idColaborador);

        dadosMes.valoresGerais.push(valor);

        /* =============================================
           IDENTIFICAR O FATOR DA RESPOSTA
        ============================================= */

        const idFator = Number(
            resposta.id_psicossocial_fator
        );

        const fator = fatores.find(
            item => Number(item.id) === idFator
        );

        if (!fator) {
            return;
        }

        if (!dadosMes.fatores[fator.nome]) {
            dadosMes.fatores[fator.nome] = {
                valores: [],
                participantes: new Set()
            };
        }

        const dadosFator =
            dadosMes.fatores[fator.nome];

        dadosFator.valores.push(valor);

        dadosFator.participantes.add(
            idColaborador
        );
    });

    /* =====================================================
       MONTAR RESULTADO FINAL
    ===================================================== */

    const mesesOrdenados = Array.from(
        mapaMensal.keys()
    ).sort();

    return mesesOrdenados.map(chaveMes => {
        const dadosMes = mapaMensal.get(chaveMes);

        const totalParticipantes =
            dadosMes.participantes.size;

        const medias = {};

        fatores.forEach(fator => {
            const dadosFator =
                dadosMes.fatores[fator.nome];

            if (!dadosFator) {
                medias[fator.nome] = null;
                return;
            }

            if (
                dadosFator.participantes.size <
                quantidadeMinima
            ) {
                medias[fator.nome] = null;
                return;
            }

            medias[fator.nome] = calcularMedia(
                dadosFator.valores
            );
        });

        return {
            id: chaveMes,
            chaveMes,
            mes: formatarMes(chaveMes),
            satisfacao: totalParticipantes >= quantidadeMinima
                ? calcularMedia(dadosMes.valoresGerais)
                : null,
            medias,
            totalParticipantes,
            possuiDadosAnonimos:
                totalParticipantes >= quantidadeMinima
        };
    });
}
