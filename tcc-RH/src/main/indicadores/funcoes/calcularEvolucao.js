/********************************************************************************
 * Objetivo:
 * Montar a evolução histórica dos indicadores por mês.
 *
 * Regras:
 * - Considera somente avaliações encerradas.
 * - Ignora avaliações canceladas.
 * - Agrupa várias avaliações do mesmo mês.
 * - Calcula a média mensal de cada fator psicossocial.
 * - Considera respostas válidas entre 1 e 5.
 * - Considera pelo menos 1 participante distinto.
 * - Respeita o filtro de setor.
 ********************************************************************************/

const QUANTIDADE_MINIMA_PARTICIPANTES = 1;

function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function converterData(data) {
    if (!data) {
        return null;
    }

    if (data instanceof Date) {
        return Number.isNaN(data.getTime()) ? null : data;
    }

    const texto = String(data);

    const somenteData = texto.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (somenteData) {
        return new Date(
            Number(somenteData[1]),
            Number(somenteData[2]) - 1,
            Number(somenteData[3])
        );
    }

    const dataConvertida = new Date(data);

    return Number.isNaN(dataConvertida.getTime())
        ? null
        : dataConvertida;
}

function obterDataAvaliacao(avaliacao) {
    return (
        avaliacao?.data_fim ||
        avaliacao?.data_final ||
        avaliacao?.data_inicio ||
        avaliacao?.data ||
        avaliacao?.created_at ||
        ''
    );
}

function obterDataResposta(resposta, avaliacao) {
    return (
        resposta?.data_resposta ||
        resposta?.data_criacao ||
        resposta?.created_at ||
        resposta?.createdAt ||
        resposta?.data ||
        obterDataAvaliacao(avaliacao)
    );
}

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

function obterIdAvaliacao(participacao) {
    return Number(
        participacao?.id_avaliacao ??
        participacao?.avaliacao?.id
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

export function calcularEvolucao({
    avaliacoes = [],
    participacoes = [],
    respostas = [],
    fatores = [],
    idSetor = null,
    quantidadeMinima = QUANTIDADE_MINIMA_PARTICIPANTES
}) {
    const avaliacoesValidas = avaliacoes.filter(
        avaliacao =>
            !avaliacaoFoiCancelada(avaliacao) &&
            avaliacaoEncerrada(avaliacao)
    );

    const mapaAvaliacoes = new Map(
        avaliacoesValidas.map(avaliacao => [
            Number(avaliacao.id),
            avaliacao
        ])
    );

    const participacoesValidas = participacoes.filter(
        participacao => {
            const idAvaliacao =
                obterIdAvaliacao(participacao);

            if (!mapaAvaliacoes.has(idAvaliacao)) {
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

    const mapaParticipacoes = new Map(
        participacoesValidas.map(participacao => [
            Number(participacao.id),
            participacao
        ])
    );

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

        const data = obterDataResposta(resposta, avaliacao);
        const chaveMes = obterChaveMes(data);

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

        const idFator = obterIdFatorResposta(resposta);

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

        const dadosFator = dadosMes.fatores[fator.nome];

        dadosFator.valores.push(valor);
        dadosFator.participantes.add(idColaborador);
    });

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

            if (
                !dadosFator ||
                dadosFator.participantes.size < quantidadeMinima
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
            satisfacao:
                totalParticipantes >= quantidadeMinima
                    ? calcularMedia(dadosMes.valoresGerais)
                    : null,
            medias,
            totalParticipantes,
            possuiDadosAnonimos:
                totalParticipantes >= quantidadeMinima
        };
    });
}