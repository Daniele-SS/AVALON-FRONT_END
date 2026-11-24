
/************************************************************************
 * Objetivo: Calcular quantidade e percentual de respostas por alternativa.
 ************************************************************************/


//----------------- NORMALIZAR VALOR -----------------------------------//

function normalizarValor(valor) {

    if (valor === null || valor === undefined) {
        return '';
    }

    return String(valor).trim().toLowerCase();

}


//----------------- CALCULAR RESULTADO --------------------------------//

export function calcularResultadoAlternativa(
    opcoes = [],
    respostas = []
) {

    // Quantidade total de respostas válidas da pergunta

    const respostasValidas = respostas.filter(resposta => {

        const valor = resposta?.valor ?? resposta?.valor_resposta ?? resposta;

        return valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== '';

    });


    const totalRespostas = respostasValidas.length;


    // Organizar as alternativas e contar suas respostas

    const resultados = opcoes.map(opcao => {

        const valorOpcao =
            typeof opcao === 'object'
                ? opcao.valor_resposta ?? opcao.valor
                : opcao;


        const quantidade = respostasValidas.filter(resposta => {

            const valorResposta =
                resposta?.valor ??
                resposta?.valor_resposta ??
                resposta;

            return normalizarValor(valorResposta) ===
                normalizarValor(valorOpcao);

        }).length;


        const percentual = totalRespostas > 0
            ? (quantidade / totalRespostas) * 100
            : 0;


        return {
            valor_resposta: valorOpcao,
            quantidade_resposta: quantidade,
            percentual: Number(percentual.toFixed(2))
        };

    });


    return {
        total_respostas: totalRespostas,
        alternativas: resultados
    };

}
