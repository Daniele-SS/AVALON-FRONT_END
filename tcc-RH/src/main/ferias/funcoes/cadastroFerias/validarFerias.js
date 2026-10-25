//----------------- VALIDAR CADASTRO DE FÉRIAS -------------//

function validarFerias({
    colaborador,
    dataInicio,
    dataFim,
    quantidadeDias,
    saldoDisponivel,
    observacao = '',
    limiteAnual = 30
}) {

    //----------------- ERROS -------------------------------//

    const erros = {};


    //----------------- COLABORADOR --------------------------//

    if (!colaborador || colaborador.id == null) {

        erros.colaborador =
            'Selecione um colaborador.';

    }


    //----------------- DATA INICIAL -------------------------//

    if (!dataInicio) {

        erros.dataInicio =
            'Informe a data de início das férias.';

    }


    //----------------- DATA FINAL ---------------------------//

    if (!dataFim) {

        erros.dataFim =
            'Informe a data de término das férias.';

    }


    //----------------- VALIDAR DATAS ------------------------//

    if (dataInicio && dataFim) {

        const inicio =
            new Date(`${dataInicio}T00:00:00`);

        const fim =
            new Date(`${dataFim}T00:00:00`);

        const hoje = new Date();

        hoje.setHours(
            0,
            0,
            0,
            0
        );


        if (
            Number.isNaN(inicio.getTime())
        ) {

            erros.dataInicio =
                'A data de início é inválida.';

        }


        if (
            Number.isNaN(fim.getTime())
        ) {

            erros.dataFim =
                'A data de término é inválida.';

        }


        if (
            !Number.isNaN(inicio.getTime()) &&
            inicio < hoje
        ) {

            erros.dataInicio =
                'A data de início não pode ser anterior a hoje.';

        }


        if (
            !Number.isNaN(inicio.getTime()) &&
            !Number.isNaN(fim.getTime()) &&
            fim < inicio
        ) {

            erros.dataFim =
                'A data de término não pode ser anterior à data de início.';

            erros.periodo =
                'O período de férias é inválido.';

        }

    }


    //----------------- QUANTIDADE ---------------------------//

    if (
        quantidadeDias > limiteAnual
    ) {

        erros.periodo =
            `O período não pode ultrapassar ${limiteAnual} dias de férias.`;

    }


    if (
        quantidadeDias > 0 &&
        saldoDisponivel < 0
    ) {

        erros.periodo =
            'O colaborador não possui saldo suficiente de férias.';

    }


    //----------------- OBSERVAÇÃO ---------------------------//

    if (
        String(observacao).length > 300
    ) {

        erros.observacao =
            'A observação deve ter no máximo 300 caracteres.';

    }


    //----------------- RESULTADO ----------------------------//

    return {

        valido:
            Object.keys(erros).length === 0,

        erros,

        colaboradorValido:
            !erros.colaborador,

        dataInicioValida:
            !erros.dataInicio,

        dataFimValida:
            !erros.dataFim,

        periodoValido:
            !erros.periodo

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default validarFerias;