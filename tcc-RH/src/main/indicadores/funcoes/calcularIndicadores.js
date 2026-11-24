
/********************************************************************************
 * Objetivo: Calcular os indicadores da avaliação selecionada.
 * Regra: Só apresentar médias quando houver pelo menos 5 participantes distintos.
 ********************************************************************************/

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;

/**
 * Obtém o colaborador da participação.
 */
function obterColaborador(participacao) {
    return Array.isArray(participacao.colaborador)
        ? participacao.colaborador[0]
        : participacao.colaborador;
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
        participacao.id_setor ??
        participacao.setor?.id
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
        participacao.id_colaborador
    );
}

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
 * Calcula a média de respostas válidas, de 1 a 5.
 */
function calcularMedia(respostas) {
    const valores = respostas
        .map(resposta => Number(resposta.valor))
        .filter(valor =>
            Number.isFinite(valor) &&
            valor >= 1 &&
            valor <= 5
        );

    if (valores.length === 0) {
        return null;
    }

    const soma = valores.reduce(
        (total, valor) => total + valor,
        0
    );

    return Number((soma / valores.length).toFixed(1));
}

/**
 * Calcula os indicadores gerais e as médias dos fatores.
 *
 * idSetor:
 * - null: considera todos os setores.
 * - número: considera somente o setor informado.
 *
 * fatores: array de objetos com id e nome.
 */
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

    const participacoesFiltradas = participacoesAvaliacao.filter(
        participacao => {
            if (idSetor === null || idSetor === undefined) {
                return true;
            }

            return obterIdSetor(participacao) === Number(idSetor);
        }
    );

    // Conta colaboradores distintos, não linhas de respostas.
    const participantesDistintos = new Set(
        participacoesFiltradas
            .map(obterIdColaborador)
            .filter(id => Number.isFinite(id) && id > 0)
    );

    const totalParticipantes = participantesDistintos.size;

    // Se não houver participantes suficientes, não exibe médias.
    if (totalParticipantes < quantidadeMinima) {
        return {
            totalParticipantes,
            satisfacaoGeral: null,
            mediasFatores: {},
            possuiDadosAnonimos: false
        };
    }

    const idsParticipacoes = new Set(
        participacoesFiltradas.map(
            participacao => Number(participacao.id)
        )
    );

    const respostasAvaliacao = respostas.filter(resposta =>
        idsParticipacoes.has(
            Number(resposta.id_avaliacao_participacao)
        )
    );

    const satisfacaoGeral = calcularMedia(respostasAvaliacao);

    const mediasFatores = {};

    fatores.forEach(fator => {
        const respostasFator = respostasAvaliacao.filter(
            resposta =>
                Number(resposta.id_psicossocial_fator) ===
                Number(fator.id)
        );

        mediasFatores[fator.nome] = calcularMedia(respostasFator);
    });

    return {
        totalParticipantes,
        satisfacaoGeral,
        mediasFatores,
        possuiDadosAnonimos: true
    };
}
