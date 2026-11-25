
/********************************************************************************
 * Objetivo:
 * Comparar a média de um fator psicossocial entre os setores.
 *
 * Regras:
 * - Considera todas as avaliações encerradas.
 * - Ignora avaliações canceladas.
 * - Agrupa respostas de avaliações diferentes por setor.
 * - Considera pelo menos 1 participante distinto por setor.
 * - Calcula a média das respostas válidas de 1 a 5.
 * - Mantém todos os setores na comparação, mesmo sem respostas.
 ********************************************************************************/

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;
const PARAMETRO_MINIMO = 2.5;

/* =========================================================
   TEXTO
========================================================= */

function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/* =========================================================
   AVALIAÇÕES
========================================================= */

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
 * Converte a data final da avaliação.
 */
function converterDataFinal(avaliacao) {
    const dataFim =
        avaliacao?.data_fim ||
        avaliacao?.data_final;

    if (!dataFim) {
        return null;
    }

    const texto = String(dataFim);

    const somenteData = texto.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    const data = somenteData
        ? new Date(
            Number(somenteData[1]),
            Number(somenteData[2]) - 1,
            Number(somenteData[3])
        )
        : new Date(dataFim);

    return Number.isNaN(data.getTime())
        ? null
        : data;
}

/**
 * Considera encerrada quando:
 * - O status indica que a avaliação foi concluída;
 * - Ou a data final é hoje ou uma data anterior.
 */
function avaliacaoEncerrada(avaliacao) {
    // Status 1 significa avaliação encerrada no backend.
    if (Number(avaliacao.status) === 1) {
        return true;
    }

    // Status 0 significa avaliação aberta.
    if (Number(avaliacao.status) === 0) {
        return false;
    }

    // Caso o backend retorne status textual,
    // mantém a verificação por nome.
    const status = obterStatusAvaliacao(avaliacao);

    return (
        status.includes('encerrada') ||
        status.includes('encerrado') ||
        status.includes('concluida') ||
        status.includes('concluido') ||
        status.includes('finalizada') ||
        status.includes('finalizado')
    );
}

/* =========================================================
   PARTICIPAÇÕES
========================================================= */

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

/* =========================================================
   RESPOSTAS
========================================================= */

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

    return Number(
        (soma / valores.length).toFixed(1)
    );
}

/* =========================================================
   CLASSIFICAÇÃO
========================================================= */

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

/* =========================================================
   COMPARAÇÃO POR SETOR
========================================================= */

export function calcularComparacaoSetores({
    setores = [],
    avaliacoes = [],
    participacoes = [],
    respostas = [],
    idFator,
    quantidadeMinima = QUANTIDADE_MINIMA_PARTICIPANTES
}) {
    /*
     * 1. Seleciona avaliações encerradas
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
     * 2. Seleciona participações pertencentes
     * às avaliações encerradas.
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
     * 3. Relaciona as participações pelo ID.
     */
    const participacoesPorId = new Map(
        participacoesValidas.map(
            participacao => [
                Number(participacao.id),
                participacao
            ]
        )
    );

    /*
     * 4. Seleciona respostas do fator escolhido
     * e identifica o setor de cada resposta.
     */
    const respostasValidas = respostas
        .filter(
            resposta =>
                Number(resposta.id_psicossocial_fator) ===
                Number(idFator)
        )
        .map(resposta => {
            const idParticipacao =
                obterIdParticipacaoResposta(resposta);

            const participacao =
                participacoesPorId.get(idParticipacao);

            const valor =
                obterValorResposta(resposta);

            if (
                !participacao ||
                valor === null
            ) {
                return null;
            }

            const idSetor = obterIdSetor(participacao);
            const idColaborador =
                obterIdColaborador(participacao);

            if (
                !Number.isFinite(idSetor) ||
                idSetor <= 0
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
     * 5. Calcula a média de cada setor.
     *
     * IMPORTANTE:
     * Não remove setores sem respostas.
     * Todos os setores recebidos permanecem na lista.
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

        /*
         * Setor sem respostas válidas continua aparecendo,
         * mas sem média.
         */
        if (
            totalParticipantes < quantidadeMinima ||
            totalRespostas === 0
        )
        
        {
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
