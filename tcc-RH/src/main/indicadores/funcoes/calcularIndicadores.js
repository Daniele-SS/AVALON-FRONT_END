/********************************************************************************
 * Objetivo:
 * Calcular os indicadores da avaliação selecionada.
 *
 * Regras:
 * - Considera pelo menos 1 participante distinto com resposta válida.
 * - Considera somente respostas com valores entre 1 e 5.
 * - Respeita o filtro de setor.
 * - Não apresenta médias quando não existem respostas válidas.
 ********************************************************************************/

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;

/**
 * Obtém o colaborador da participação.
 */
function obterColaborador(participacao) {
    return Array.isArray(participacao?.colaborador)
        ? participacao.colaborador[0]
        : participacao?.colaborador;
}

/**
 * Obtém o setor do colaborador.
 */
function obterSetorColaborador(participacao) {
    const colaborador = obterColaborador(participacao);

    return Array.isArray(colaborador?.setor)
        ? colaborador.setor[0]
        : colaborador?.setor;
}

/**
 * Obtém o ID do setor da participação.
 */
function obterIdSetor(participacao) {
    const colaborador = obterColaborador(participacao);
    const setor = obterSetorColaborador(participacao);

    return Number(
        colaborador?.id_setor ??
        setor?.id ??
        participacao?.id_setor ??
        participacao?.setor?.id
    );
}

/**
 * Obtém o ID do colaborador.
 */
function obterIdColaborador(participacao) {
    const colaborador = obterColaborador(participacao);

    return Number(
        colaborador?.id ??
        colaborador?.id_colaborador ??
        participacao?.id_colaborador
    );
}

/**
 * Obtém o ID da avaliação vinculada à participação.
 */
function obterIdAvaliacao(participacao) {
    return Number(
        participacao?.id_avaliacao ??
        participacao?.avaliacao?.id
    );
}

/**
 * Obtém o ID da participação vinculada à resposta.
 */
function obterIdParticipacaoResposta(resposta) {
    return Number(
        resposta?.id_avaliacao_participacao ??
        resposta?.avaliacao_participacao?.id
    );
}

/**
 * Obtém o ID do fator psicossocial da resposta.
 */
function obterIdFatorResposta(resposta) {
    return Number(
        resposta?.id_psicossocial_fator ??
        resposta?.psicossocial_fator?.id ??
        resposta?.fator_psicossocial?.id ??
        resposta?.id_fator_psicossocial
    );
}

/**
 * Converte o valor da resposta para número.
 */
function obterValorResposta(resposta) {
    const valor = Number(
        String(resposta?.valor ?? '').replace(',', '.')
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

/**
 * Calcula a média de respostas válidas.
 */
function calcularMedia(respostas) {
    const valores = respostas
        .map(obterValorResposta)
        .filter(valor => valor !== null);

    if (valores.length === 0) {
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
 * Calcula os indicadores gerais e as médias dos fatores.
 *
 * idSetor:
 * - null: considera todos os setores.
 * - número: considera somente o setor informado.
 *
 * fatores:
 * - Array de objetos contendo id e nome.
 */
export function calcularIndicadores({
    participacoes = [],
    respostas = [],
    idAvaliacao,
    idSetor = null,
    fatores = [],
    quantidadeMinima = QUANTIDADE_MINIMA_PARTICIPANTES
}) {
    /* =====================================================
       PARTICIPAÇÕES DA AVALIAÇÃO
    ===================================================== */

    const participacoesAvaliacao = participacoes.filter(
        participacao =>
            obterIdAvaliacao(participacao) ===
            Number(idAvaliacao)
    );

    /* =====================================================
       FILTRAR SETOR
    ===================================================== */

    const participacoesFiltradas =
        participacoesAvaliacao.filter(participacao => {
            if (
                idSetor === null ||
                idSetor === undefined
            ) {
                return true;
            }

            return (
                obterIdSetor(participacao) ===
                Number(idSetor)
            );
        });

    /* =====================================================
       MAPEAR PARTICIPAÇÕES
    ===================================================== */

    const mapaParticipacoes = new Map();

    participacoesFiltradas.forEach(participacao => {
        const idParticipacao = Number(
            participacao.id
        );

        const idColaborador =
            obterIdColaborador(participacao);

        if (
            Number.isFinite(idParticipacao) &&
            idParticipacao > 0
        ) {
            mapaParticipacoes.set(
                idParticipacao,
                {
                    participacao,
                    idColaborador
                }
            );
        }
    });

    /* =====================================================
       RESPOSTAS VÁLIDAS DA AVALIAÇÃO
    ===================================================== */

    const respostasAvaliacao = respostas.filter(
        resposta => {
            const idParticipacao =
                obterIdParticipacaoResposta(resposta);

            const participacao =
                mapaParticipacoes.get(idParticipacao);

            if (!participacao) {
                return false;
            }

            return obterValorResposta(resposta) !== null;
        }
    );

    /* =====================================================
       PARTICIPANTES DISTINTOS COM RESPOSTAS VÁLIDAS
    ===================================================== */

    const participantesDistintos = new Set();

    respostasAvaliacao.forEach(resposta => {
        const idParticipacao =
            obterIdParticipacaoResposta(resposta);

        const dadosParticipacao =
            mapaParticipacoes.get(idParticipacao);

        const idColaborador =
            dadosParticipacao?.idColaborador;

        if (
            Number.isFinite(idColaborador) &&
            idColaborador > 0
        ) {
            participantesDistintos.add(
                idColaborador
            );
        }
    });

    const totalParticipantes =
        participantesDistintos.size;

    /* =====================================================
       VERIFICAR QUANTIDADE MÍNIMA
    ===================================================== */

    if (
        totalParticipantes <
        quantidadeMinima
    ) {
        return {
            totalParticipantes,
            satisfacaoGeral: null,
            mediasFatores: {},
            possuiDadosAnonimos: false
        };
    }

    /* =====================================================
       SATISFAÇÃO GERAL
    ===================================================== */

    const satisfacaoGeral =
        calcularMedia(respostasAvaliacao);

    /* =====================================================
       MÉDIAS DOS FATORES PSICOSSOCIAIS
    ===================================================== */

    const mediasFatores = {};

    fatores.forEach(fator => {
        const respostasFator =
            respostasAvaliacao.filter(resposta =>
                obterIdFatorResposta(resposta) ===
                Number(fator.id)
            );

        mediasFatores[fator.nome] =
            calcularMedia(respostasFator);
    });

    /* =====================================================
       RETORNO
    ===================================================== */

    return {
        totalParticipantes,
        satisfacaoGeral,
        mediasFatores,
        possuiDadosAnonimos:
            respostasAvaliacao.length > 0
    };
}