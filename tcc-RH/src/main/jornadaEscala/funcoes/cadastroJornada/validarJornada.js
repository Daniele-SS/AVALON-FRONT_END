//----------------- VALIDAÇÃO DA JORNADA -----------------------------//

function validarJornada(dadosJornada) {

    // Validar nome
    if (!dadosJornada.nome || !dadosJornada.nome.trim()) {
        return 'Informe o nome da jornada.';
    }

    // Validar horários
    if (!dadosJornada.horarioInicio || !dadosJornada.horarioTermino) {
        return 'Informe o horário de início e término.';
    }

    // Impedir horários iguais
    if (dadosJornada.horarioInicio === dadosJornada.horarioTermino) {
        return 'O horário de início e término não podem ser iguais.';
    }

    // Validar dias selecionados
    if (
        !Array.isArray(dadosJornada.diasAtivos) ||
        dadosJornada.diasAtivos.length === 0
    ) {
        return 'Selecione pelo menos um dia de trabalho.';
    }

    return '';
}

//----------------- EXPORTAÇÃO -----------------------------------//

export default validarJornada;