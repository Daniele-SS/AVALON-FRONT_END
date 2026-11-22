
/********************************************************************************
 * Objetivo: Montar os dados históricos do gráfico de evolução dos indicadores.
 ********************************************************************************/

const QUANTIDADE_MINIMA_PARTICIPANTES = 5;

/**
 * Obtém a data da avaliação.
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
 * Obtém o ID da avaliação vinculada à participação.
 */
function obterIdAvaliacao(participacao) {
    return Number(
        participacao.id_avaliacao ??
        participacao.avaliacao?.id
    );
}

/**
 * Obtém o colaborador da participação.
 */
function obterColaborador(participacao) {
    return Array.isArray(participacao.colaborador)
        ? participacao.colaborador[0]
        : participacao.colaborador;
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
 * Calcula a média das respostas válidas.
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
 * Formata o mês e o ano para aparecer no eixo do gráfico.
 */
function formatarMes(data) {
    if (!data) {
        return '';
    }

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
        return '';
    }

    const mes = dataConvertida.toLocaleDateString(
        'pt-BR',
        { month: 'long' }
    );

    const ano = dataConvertida.getFullYear();

    return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${ano}`;
}

/**
 * Calcula a evolução dos indicadores ao longo das avaliações.
 *
 * idSetor:
 * - null: considera todos os setores.
 * - número: considera somente o setor informado.
 *
 * fatores: array de objetos com id e nome.
 */
export function calcularEvolucao({
    avaliacoes = [],
    participacoes = [],
    respostas = [],
    fatores = [],
    idSetor = null,
    quantidadeMinima = QUANTIDADE_MINIMA_PARTICIPANTES
}) {
    const avaliacoesOrdenadas = [...avaliacoes].sort(
        (a, b) => {
            const dataA = new Date(
                obterDataAvaliacao(a)
            ).getTime() || 0;

            const dataB = new Date(
                obterDataAvaliacao(b)
            ).getTime() || 0;

            return dataA - dataB;
        }
    );

    return avaliacoesOrdenadas.map(avaliacao => {
        const participacoesAvaliacao = participacoes.filter(
            participacao =>
                obterIdAvaliacao(participacao) ===
                Number(avaliacao.id)
        );

        const participacoesFiltradas =
            participacoesAvaliacao.filter(participacao => {
                if (idSetor === null || idSetor === undefined) {
                    return true;
                }

                return obterIdSetor(participacao) ===
                    Number(idSetor);
            });

        // Conta participantes distintos para preservar o anonimato.
        const participantesDistintos = new Set(
            participacoesFiltradas
                .map(obterIdColaborador)
                .filter(id => Number.isFinite(id) && id > 0)
        );

        const totalParticipantes = participantesDistintos.size;

        // Não apresenta dados de avaliações com menos de 5 participantes.
        if (totalParticipantes < quantidadeMinima) {
            return {
                id: avaliacao.id,
                mes: formatarMes(obterDataAvaliacao(avaliacao)),
                satisfacao: null,
                medias: {},
                totalParticipantes,
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

        const medias = {};

        fatores.forEach(fator => {
            const respostasFator = respostasAvaliacao.filter(
                resposta =>
                    Number(resposta.id_psicossocial_fator) ===
                    Number(fator.id)
            );

            medias[fator.nome] = calcularMedia(respostasFator);
        });

        return {
            id: avaliacao.id,
            mes: formatarMes(obterDataAvaliacao(avaliacao)),
            satisfacao: calcularMedia(respostasAvaliacao),
            medias,
            totalParticipantes,
            possuiDadosAnonimos: true
        };
    });
}
