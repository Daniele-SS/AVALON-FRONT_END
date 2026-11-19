
function compararValor(media, operador, referencia) {

    switch (operador) {

        case '=':
            return media === referencia;

        case '>':
            return media > referencia;

        case '<':
            return media < referencia;

        case '>=':
            return media >= referencia;

        case '<=':
            return media <= referencia;

        case '<>':
            return media !== referencia;

        default:
            return false;

    }

}


// Padroniza a classificação recebida pela API.
function normalizarClassificacao(classificacao) {

    const valor = String(classificacao || '')
        .trim()
        .toUpperCase();

    switch (valor) {

        case 'NORMAL':
            return 'Normal';

        case 'ATENÇÃO':
        case 'ATENCAO':
            return 'Atenção';

        case 'PRIORIDADE':
            return 'Prioridade';

        default:
            return classificacao;

    }

}


function classificarResultados(media, idFator, regras) {

    if (media === null || media === undefined) {

        return {
            classificacao: 'Indisponível',
            acao: ''
        };

    }

    // Considera somente as regras vinculadas ao fator.
    const regrasFator = regras.filter((regra) => {

        return (
            Number(regra.id_psicossocial_fator) === Number(idFator) &&
            Number(regra.ativo) === 1
        );

    });

    // Verifica quais regras correspondem à média calculada.
    const regrasCorrespondentes = regrasFator.filter((regra) => {

        return compararValor(
            Number(media),
            regra.operador,
            Number(regra.valor_referencial)
        );

    });

    if (regrasCorrespondentes.length === 0) {

        return {
            classificacao: 'Não classificado',
            acao: ''
        };

    }

    // Prioriza a classificação de maior gravidade.
    const prioridade = {
        'Normal': 1,
        'Atenção': 2,
        'Prioridade': 3
    };

    regrasCorrespondentes.sort((a, b) => {

        const classificacaoA = normalizarClassificacao(a.classificacao);
        const classificacaoB = normalizarClassificacao(b.classificacao);

        return (
            (prioridade[classificacaoB] || 0) -
            (prioridade[classificacaoA] || 0)
        );

    });

    const regraSelecionada = regrasCorrespondentes[0];

    return {
        classificacao: normalizarClassificacao(
            regraSelecionada.classificacao
        ),
        acao: regraSelecionada.acao ?? ''
    };

}

export default classificarResultados;
