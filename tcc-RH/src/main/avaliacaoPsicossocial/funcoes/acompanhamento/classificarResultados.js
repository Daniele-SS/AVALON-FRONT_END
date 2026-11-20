
/********************************************************************************
 * Objetivo: Classificar os resultados dos fatores psicossociais utilizando
 *           as regras cadastradas no Motor de Regras.
 *           Quando nenhuma condição de risco for atingida, classifica como Normal.
 ********************************************************************************/


//----------------- COMPARAR VALORES ------------------------//

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


//----------------- NORMALIZAR CLASSIFICAÇÃO ----------------//

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


//----------------- CLASSIFICAR RESULTADOS ------------------//

function classificarResultados(media, idFator, regras) {

    // Verifica se existe uma média disponível.
    if (media === null || media === undefined) {

        return {
            classificacao: 'Indisponível',
            acao: ''
        };

    }


    // Considera somente as regras ativas vinculadas ao fator.
    const regrasFator = regras.filter((regra) => {

        return (
            Number(regra.id_psicossocial_fator) === Number(idFator) &&
            Number(regra.ativo) === 1
        );

    });


    // Não classifica automaticamente quando não existem regras cadastradas.
    if (regrasFator.length === 0) {

        return {
            classificacao: 'Não classificado',
            acao: ''
        };

    }


    // Verifica quais regras correspondem à média calculada.
    const regrasCorrespondentes = regrasFator.filter((regra) => {

        return compararValor(
            Number(media),
            regra.operador,
            Number(regra.valor_referencial)
        );

    });


    // Nenhuma condição de risco foi atingida.
    // Nesse caso, considera o resultado como Normal.
    if (regrasCorrespondentes.length === 0) {

        return {
            classificacao: 'Normal',
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


    // Seleciona a regra de maior gravidade.
    const regraSelecionada = regrasCorrespondentes[0];


    return {

        classificacao: normalizarClassificacao(
            regraSelecionada.classificacao
        ),

        acao: regraSelecionada.acao ?? ''

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default classificarResultados;
