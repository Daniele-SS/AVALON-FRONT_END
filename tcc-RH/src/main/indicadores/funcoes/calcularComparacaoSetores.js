
/********************************************************************************
 * Objetivo: Calcular a média de um fator por setor na avaliação mais recente.
 * Regra de anonimato: mínimo de 5 participantes distintos por setor.
 ********************************************************************************/

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;
const PARAMETRO_MINIMO = 2.5;

function obterColaborador(participacao) {
    return Array.isArray(participacao.colaborador)
        ? participacao.colaborador[0]
        : participacao.colaborador;
}

function obterIdColaborador(participacao) {
    const colaborador = obterColaborador(participacao);

    return Number(
        colaborador?.id ??
        colaborador?.id_colaborador ??
        participacao.id_colaborador
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
        participacao.id_setor ??
        participacao.setor?.id
    );
}

function obterIdAvaliacao(participacao) {
    return Number(
        participacao.id_avaliacao ??
        participacao.avaliacao?.id
    );
}

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

function obterClassificacao(media) {
    if (media === null) {
        return 'Sem dados';
    }

    if (media < PARAMETRO_MINIMO) {
        return 'Abaixo da Meta';
    }

    if (media < 3.5) {
        return 'Atenção';
    }

    return 'Normal';
}

/**
 * Parâmetros:
 * - setores: setores cadastrados.
 * - participacoes: participações da API.
 * - respostas: respostas da API.
 * - idAvaliacao: ID da avaliação mais recente.
 * - idFator: ID do fator selecionado.
 */
export function calcularComparacaoSetores({
    setores = [],
    participacoes = [],
    respostas = [],
    idAvaliacao,
    idFator,
    quantidadeMinima = QUANTIDADE_MINIMA_PARTICIPANTES
}) {
    return setores.map(setor => {
        const participacoesSetor = participacoes.filter(
            participacao =>
                obterIdAvaliacao(participacao) === Number(idAvaliacao) &&
                obterIdSetor(participacao) === Number(setor.id)
        );

        const participantesDistintos = new Set(
            participacoesSetor
                .map(obterIdColaborador)
                .filter(id => Number.isFinite(id) && id > 0)
        );

        const totalParticipantes = participantesDistintos.size;

        // Não retorna médias de grupos com menos de 5 participantes.
        if (totalParticipantes < quantidadeMinima) {
            return null;
        }

        const idsParticipacoes = new Set(
            participacoesSetor.map(
                participacao => Number(participacao.id)
            )
        );

        const respostasFator = respostas.filter(resposta =>
            idsParticipacoes.has(
                Number(resposta.id_avaliacao_participacao)
            ) &&
            Number(resposta.id_psicossocial_fator) === Number(idFator)
        );

        const media = calcularMedia(respostasFator);

        if (media === null) {
            return null;
        }

        return {
            id: setor.id,
            codigo: setor.codigo || '',
            nome: setor.nome || 'Setor',
            media,
            totalParticipantes,
            classificacao: obterClassificacao(media),
            abaixoDaMeta: media < PARAMETRO_MINIMO
        };
    }).filter(Boolean);
}
