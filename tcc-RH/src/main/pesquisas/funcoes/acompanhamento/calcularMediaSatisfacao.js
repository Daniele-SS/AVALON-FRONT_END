
/************************************************************************
 * Objetivo: Calcular a média de satisfação das respostas de uma pergunta
 *          de alternativa.
 *
 * Escala:
 * 5 - Excelente
 * 4 - Bom
 * 3 - Regular
 * 2 - Ruim
 * 1 - Muito ruim
 ************************************************************************/


//----------------- INTERPRETAR RESPOSTA -------------------------------//

function interpretarRespostaSatisfacao(valor) {

    if (valor === null || valor === undefined) {
        return null;
    }

    const resposta = String(valor).trim().toLowerCase();


    // Respostas numéricas de 1 a 5

    const numero = Number(resposta);

    if (
        resposta !== '' &&
        Number.isFinite(numero) &&
        numero >= 1 &&
        numero <= 5
    ) {
        return numero;
    }


    // Respostas textuais

    const respostasTextuais = {
        'excelente': 5,
        'ótimo': 5,
        'otimo': 5,

        'bom': 4,

        'regular': 3,

        'ruim': 2,

        'muito ruim': 1
    };

    return respostasTextuais[resposta] ?? null;

}


//----------------- CALCULAR MÉDIA ------------------------------------//

export function calcularMediaSatisfacao(respostas = []) {

    const valoresValidos = respostas
        .map(resposta => interpretarRespostaSatisfacao(
            resposta?.valor ?? resposta?.valor_resposta ?? resposta
        ))
        .filter(valor => valor !== null);


    // Não existe média quando não há respostas válidas

    if (valoresValidos.length === 0) {
        return null;
    }


    const soma = valoresValidos.reduce(
        (total, valor) => total + valor,
        0
    );

    const media = soma / valoresValidos.length;


    // Retorna a média com uma casa decimal

    return Number(media.toFixed(1));

}
