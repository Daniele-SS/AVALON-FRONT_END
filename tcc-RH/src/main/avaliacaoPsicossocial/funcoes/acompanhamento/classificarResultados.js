
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

function classificarResultados(media, idFator, regras) {

    if (media === null || media === undefined) {
        return {
            classificacao: 'Indisponível',
            acao: ''
        };
    }

    const regrasAtivas = regras.filter((regra) => {

        const idFatorRegra =
            regra.fator_psicossocial?.id ??
            regra.id_psicossocial_fator;

        return (
            Number(idFatorRegra) === Number(idFator) &&
            Number(regra.ativo) === 1
        );

    });

    const regrasCorrespondentes = regrasAtivas.filter((regra) => {

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

        return (
            (prioridade[b.classificacao] || 0) -
            (prioridade[a.classificacao] || 0)
        );

    });

    const regraSelecionada = regrasCorrespondentes[0];

    return {
        classificacao: regraSelecionada.classificacao,
        acao: regraSelecionada.acao ?? ''
    };

}

export default classificarResultados;
