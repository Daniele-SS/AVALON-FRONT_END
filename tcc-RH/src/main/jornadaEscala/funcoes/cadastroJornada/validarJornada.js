
 //----------------- VALIDAÇÃO DA JORNADA -----------------------------//

function validarJornada(dadosJornada) {

    // Recuperar os dados tratados.
    const nome = (dadosJornada.nome || '').trim();
    const horarioInicio = (dadosJornada.horarioInicio || '').trim();
    const horarioTermino = (dadosJornada.horarioTermino || '').trim();
    const diasAtivos = dadosJornada.diasAtivos;

    // Guardar os erros encontrados.
    const erros = {};


    //----------------- VALIDAR NOME -----------------------------//

    if (nome === '') {
        erros.nome = 'Informe o nome da jornada.';
    }


    //----------------- VALIDAR HORÁRIO DE INÍCIO ----------------//

    const horarioInicioValido =
        /^([01]\d|2[0-3]):([0-5]\d)$/.test(horarioInicio);

    if (horarioInicio === '') {
        erros.horarioInicio = 'Informe o horário de início.';
    } else if (!horarioInicioValido) {
        erros.horarioInicio =
            'Informe um horário válido entre 00:00 e 23:59.';
    }


    //----------------- VALIDAR HORÁRIO DE TÉRMINO ---------------//

    const horarioTerminoValido =
        /^([01]\d|2[0-3]):([0-5]\d)$/.test(horarioTermino);

    if (horarioTermino === '') {
        erros.horarioTermino = 'Informe o horário de término.';
    } else if (!horarioTerminoValido) {
        erros.horarioTermino =
            'Informe um horário válido entre 00:00 e 23:59.';
    } else if (
        horarioInicioValido &&
        horarioInicio === horarioTermino
    ) {
        erros.horarioTermino =
            'O horário de início e término não podem ser iguais.';
    }


    //----------------- VALIDAR DIAS DE TRABALHO -----------------//

    if (
        !Array.isArray(diasAtivos) ||
        diasAtivos.length === 0
    ) {
        erros.diasAtivos = 'Selecione pelo menos um dia de trabalho.';
    }


    //----------------- RETORNAR RESULTADO -----------------------//

    return {
        valido: Object.keys(erros).length === 0,

        erros,

        nomeValido: !erros.nome,
        horarioInicioValido: !erros.horarioInicio,
        horarioTerminoValido: !erros.horarioTermino,
        diasAtivosValidos: !erros.diasAtivos,

        erroNome: erros.nome || '',
        erroHorarioInicio: erros.horarioInicio || '',
        erroHorarioTermino: erros.horarioTermino || '',
        erroDiasAtivos: erros.diasAtivos || '',

        nomeComErro: Boolean(erros.nome),
        horarioInicioComErro: Boolean(erros.horarioInicio),
        horarioTerminoComErro: Boolean(erros.horarioTermino),
        diasAtivosComErro: Boolean(erros.diasAtivos)
    };
}


//----------------- EXPORTAÇÃO -----------------------------------//

export default validarJornada;
