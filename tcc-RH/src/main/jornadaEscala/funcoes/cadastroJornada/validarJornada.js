//----------------- VALIDAÇÃO DA JORNADA -----------------------------//

function validarJornada(dadosJornada) {

    // Guardar os dados tratados para evitar erros caso algum campo esteja vazio
    const nome = (dadosJornada.nome || '').trim();
    const horarioInicio = dadosJornada.horarioInicio || '';
    const horarioTermino = dadosJornada.horarioTermino || '';
    const diasAtivos = dadosJornada.diasAtivos;

    // Guardar os erros encontrados
    const erros = {};

    //----------------- VALIDAR NOME -----------------------------//

    if (nome === '') {
        erros.nome = 'Informe o nome da jornada.';
    }

    //----------------- VALIDAR HORÁRIO DE INÍCIO -----------------------------//

    if (horarioInicio === '') {
        erros.horarioInicio = 'Informe o horário de início.';
    }

    //----------------- VALIDAR HORÁRIO DE TÉRMINO -----------------------------//

    if (horarioTermino === '') {
        erros.horarioTermino = 'Informe o horário de término.';
    } else if (
        horarioInicio !== '' &&
        horarioInicio === horarioTermino
    ) {
        erros.horarioTermino =
            'O horário de início e término não podem ser iguais.';
    }

    //----------------- VALIDAR DIAS DE TRABALHO -----------------------------//

    if (
        !Array.isArray(diasAtivos) ||
        diasAtivos.length === 0
    ) {
        erros.diasAtivos = 'Selecione pelo menos um dia de trabalho.';
    }

    //----------------- RETORNAR RESULTADO -----------------------------//

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