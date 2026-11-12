
//----------------- VALIDAR CONDIÇÃO -------------------------//

function validarCondicao(valorReferencia, condicoesAdicionais) {


    //----------------- VALIDAR VALOR PRINCIPAL --------------//

    if (
        valorReferencia === '' ||
        Number.isNaN(Number(valorReferencia)) ||
        Number(valorReferencia) < 1 ||
        Number(valorReferencia) > 5
    ) {

        return {

            valido: false,

            erroValor: 'Informe um valor entre 1 e 5.',

            condicaoIncompleta: false

        };

    }


    //----------------- VALIDAR CONDIÇÕES ADICIONAIS ----------//

    const condicaoIncompleta = condicoesAdicionais.some(
        (condicao) => !condicao.valor.trim()
    );


    //----------------- RETORNAR RESULTADO -------------------//

    return {

        valido: true,

        erroValor: '',

        condicaoIncompleta

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default validarCondicao;
