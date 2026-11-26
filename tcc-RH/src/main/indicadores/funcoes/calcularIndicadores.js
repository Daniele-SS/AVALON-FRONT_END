/********************************************************************************
 * Objetivo:
 * Calcular os indicadores da avaliação selecionada.
 *
 * Regras:
 * - A avaliação selecionada deve estar encerrada.
 * - Considera pelo menos 1 participante distinto com resposta válida.
 * - Considera somente respostas entre 1 e 5.
 * - Respeita o filtro de setor.
 ********************************************************************************/

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;

function obterColaborador(participacao) {
    return Array.isArray(participacao?.colaborador)
        ? participacao.colaborador[0]
        : participacao?.colaborador;
}

function obterSetorColaborador(participacao) {
    const colaborador = obterColaborador(participacao);

    return Array.isArray(colaborador?.setor)
        ? colaborador.setor[0]
        : colaborador?.setor;
}

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

function obterIdColaborador(participacao) {
    const colaborador = obterColaborador(participacao);

    return Number(
        colaborador?.id ??
        colaborador?.id_colaborador ??
        participacao?.id_colaborador
    );
}

function obterIdAvaliacao(participacao) {
    return Number(
        participacao?.id_avaliacao ??
        participacao?.avaliacao?.id
    );
}

function obterIdParticipacaoResposta(resposta) {
    return Number(
        resposta?.id_avaliacao_participacao ??
        resposta?.avaliacao_participacao?.id
    );
}

function obterIdFatorResposta(resposta) {
    return Number(
        resposta?.id_psicossocial_fator ??
        resposta?.psicossocial_fator?.id ??
        resposta?.fator_psicossocial?.id ??
        resposta?.id_fator_psicossocial
    );
}

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

function calcularMedia(respostas) {
    const valores = respostas
        .map(obterValorResposta)
        .filter(valor => valor !== null);

    if (!valores.length) {
        return null;
    }

    const soma = valores.reduce(
        (total, valor) => total + valor,
        0
    );

    return Number((soma / valores.length).toFixed(1));
}

export function calcularIndicadores({
    participacoes = [],
    respostas = [],
    idAvaliacao,
    idSetor = null,
    fatores = [],
    quantidadeMinima = QUANTIDADE_MINIMA_PARTICIPANTES
}) {
    const participacoesAvaliacao = participacoes.filter(
        participacao =>
            obterIdAvaliacao(participacao) === Number(idAvaliacao)
    );

    const participacoesFiltradas =
        participacoesAvaliacao.filter(participacao => {
            if (idSetor === null || idSetor === undefined) {
                return true;
            }

            return obterIdSetor(participacao) === Number(idSetor);
        });

    const mapaParticipacoes = new Map();

    participacoesFiltradas.forEach(participacao => {
        const idParticipacao = Number(participacao.id);
        const idColaborador = obterIdColaborador(participacao);

        if (
            Number.isFinite(idParticipacao) &&
            idParticipacao > 0
        ) {
            mapaParticipacoes.set(idParticipacao, {
                participacao,
                idColaborador
            });
        }
    });

    const respostasAvaliacao = respostas.filter(resposta => {
        const idParticipacao =
            obterIdParticipacaoResposta(resposta);

        return (
            mapaParticipacoes.has(idParticipacao) &&
            obterValorResposta(resposta) !== null
        );
    });

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
            participantesDistintos.add(idColaborador);
        }
    });

    const totalParticipantes =
        participantesDistintos.size;

    if (totalParticipantes < quantidadeMinima) {
        return {
            totalParticipantes,
            satisfacaoGeral: null,
            mediasFatores: {},
            possuiDadosAnonimos: false
        };
    }

    const satisfacaoGeral =
        calcularMedia(respostasAvaliacao);

    const mediasFatores = {};

    fatores.forEach(fator => {
        const respostasFator = respostasAvaliacao.filter(
            resposta =>
                obterIdFatorResposta(resposta) === Number(fator.id)
        );

        mediasFatores[fator.nome] =
            calcularMedia(respostasFator);
    });

    return {
        totalParticipantes,
        satisfacaoGeral,
        mediasFatores,
        possuiDadosAnonimos:
            respostasAvaliacao.length > 0
    };
}