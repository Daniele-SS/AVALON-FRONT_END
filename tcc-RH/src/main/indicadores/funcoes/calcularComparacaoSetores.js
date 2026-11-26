/********************************************************************************
 * Objetivo:
 * Comparar a média de um fator psicossocial entre os setores.
 *
 * Regras:
 * - Considera somente avaliações encerradas.
 * - Ignora avaliações canceladas.
 * - Agrupa respostas de avaliações diferentes por setor.
 * - Considera pelo menos 1 participante distinto por setor.
 * - Calcula a média das respostas válidas de 1 a 5.
 * - Mantém todos os setores recebidos, mesmo sem respostas.
 ********************************************************************************/

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;
const PARAMETRO_MINIMO = 2.5;

function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function obterStatusAvaliacao(avaliacao) {
    return (
        avaliacao?.status?.nome ||
        avaliacao?.status?.descricao ||
        avaliacao?.status ||
        avaliacao?.situacao?.nome ||
        avaliacao?.situacao ||
        avaliacao?.estado?.nome ||
        avaliacao?.estado ||
        ''
    );
}

function avaliacaoFoiCancelada(avaliacao) {
    const status = normalizarTexto(
        obterStatusAvaliacao(avaliacao)
    );

    return (
        status.includes('cancelad') ||
        status.includes('excluid') ||
        status.includes('apagada')
    );
}

/**
 * Status numérico 1 = encerrada.
 * Status numérico 0 = aberta/em andamento.
 * Também aceita status textual.
 */
function avaliacaoEncerrada(avaliacao) {
    const statusOriginal = obterStatusAvaliacao(avaliacao);

    if (Number(statusOriginal) === 1) {
        return true;
    }

    if (Number(statusOriginal) === 0) {
        return false;
    }

    const status = normalizarTexto(statusOriginal);

    return (
        status.includes('encerrad') ||
        status.includes('concluid') ||
        status.includes('finalizad')
    );
}

function obterColaborador(participacao) {
    return Array.isArray(participacao?.colaborador)
        ? participacao.colaborador[0]
        : participacao?.colaborador;
}

function obterIdColaborador(participacao) {
    const colaborador = obterColaborador(participacao);

    return Number(
        colaborador?.id ??
        colaborador?.id_colaborador ??
        participacao?.id_colaborador
    );
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

function calcularMedia(valores) {
    if (!valores.length) {
        return null;
    }

    const soma = valores.reduce(
        (total, valor) => total + valor,
        0
    );

    return Number((soma / valores.length).toFixed(1));
}

function obterClassificacao(media) {
    if (
        media === null ||
        media === undefined ||
        !Number.isFinite(Number(media))
    ) {
        return 'Sem dados';
    }

    if (Number(media) < PARAMETRO_MINIMO) {
        return 'Abaixo da Meta';
    }

    if (Number(media) < 3.5) {
        return 'Atenção';
    }

    return 'Normal';
}

export function calcularComparacaoSetores({
    setores = [],
    avaliacoes = [],
    participacoes = [],
    respostas = [],
    idFator,
    quantidadeMinima = QUANTIDADE_MINIMA_PARTICIPANTES
}) {
    /*
     * 1. Selecionar avaliações encerradas
     * e que não foram canceladas.
     */
    const avaliacoesValidas = avaliacoes.filter(
        avaliacao =>
            !avaliacaoFoiCancelada(avaliacao) &&
            avaliacaoEncerrada(avaliacao)
    );

    const idsAvaliacoesValidas = new Set(
        avaliacoesValidas.map(
            avaliacao => Number(avaliacao.id)
        )
    );

    /*
     * 2. Selecionar participações das avaliações encerradas.
     */
    const participacoesValidas = participacoes.filter(
        participacao => {
            const idAvaliacao =
                obterIdAvaliacao(participacao);

            const idColaborador =
                obterIdColaborador(participacao);

            return (
                idsAvaliacoesValidas.has(idAvaliacao) &&
                Number.isFinite(idColaborador) &&
                idColaborador > 0
            );
        }
    );

    /*
     * 3. Relacionar participações pelo ID.
     */
    const participacoesPorId = new Map(
        participacoesValidas.map(participacao => [
            Number(participacao.id),
            participacao
        ])
    );

    /*
     * 4. Selecionar respostas válidas do fator escolhido
     * e identificar o setor de cada resposta.
     */
    const respostasValidas = respostas
        .filter(
            resposta =>
                Number(
                    resposta?.id_psicossocial_fator ??
                    resposta?.psicossocial_fator?.id ??
                    resposta?.fator_psicossocial?.id
                ) === Number(idFator)
        )
        .map(resposta => {
            const idParticipacao =
                obterIdParticipacaoResposta(resposta);

            const participacao =
                participacoesPorId.get(idParticipacao);

            const valor =
                obterValorResposta(resposta);

            if (!participacao || valor === null) {
                return null;
            }

            const idSetor =
                obterIdSetor(participacao);

            const idColaborador =
                obterIdColaborador(participacao);

            if (
                !Number.isFinite(idSetor) ||
                idSetor <= 0 ||
                !Number.isFinite(idColaborador) ||
                idColaborador <= 0
            ) {
                return null;
            }

            return {
                idSetor,
                idColaborador,
                valor
            };
        })
        .filter(Boolean);

    /*
     * 5. Calcular a média de cada setor.
     *
     * Setores sem respostas permanecem na lista,
     * mas ficam com média null.
     */
    return setores.map(setor => {
        const idSetor = Number(setor.id);

        const respostasSetor = respostasValidas.filter(
            resposta =>
                resposta.idSetor === idSetor
        );

        const participantesDistintos = new Set(
            respostasSetor.map(
                resposta => resposta.idColaborador
            )
        );

        const totalParticipantes =
            participantesDistintos.size;

        const totalRespostas =
            respostasSetor.length;

        if (
            totalParticipantes < quantidadeMinima ||
            totalRespostas === 0
        ) {
            return {
                id: setor.id,
                codigo: setor.codigo || '',
                nome: setor.nome || 'Setor',
                media: null,
                totalParticipantes,
                totalRespostas,
                classificacao: 'Sem dados',
                abaixoDaMeta: false
            };
        }

        const media = calcularMedia(
            respostasSetor.map(
                resposta => resposta.valor
            )
        );

        return {
            id: setor.id,
            codigo: setor.codigo || '',
            nome: setor.nome || 'Setor',
            media,
            totalParticipantes,
            totalRespostas,
            classificacao: obterClassificacao(media),
            abaixoDaMeta:
                media !== null &&
                media < PARAMETRO_MINIMO
        };
    });
}