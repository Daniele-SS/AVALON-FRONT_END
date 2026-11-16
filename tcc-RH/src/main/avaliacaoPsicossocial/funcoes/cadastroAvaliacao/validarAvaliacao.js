
//----------------- VALIDAR AVALIAÇÃO -------------------------//

function validarAvaliacao({
    titulo,
    descricao,
    dataInicio,
    dataFim,
    anonimato,
    publicoSelecionado,
    itensSelecionados
}) {

    const erros = {};

    //----------------- TÍTULO --------------------------------//

    if (!titulo.trim()) {
        erros.titulo = 'Informe o título da avaliação.';
    } else if (titulo.trim().length > 100) {
        erros.titulo = 'O título deve ter no máximo 100 caracteres.';
    }

    //----------------- DESCRIÇÃO ----------------------------//

    if (descricao.trim().length > 255) {
        erros.descricao = 'A descrição deve ter no máximo 255 caracteres.';
    }

    //----------------- PERÍODO -------------------------------//

    if (!dataInicio) {
        erros.dataInicio = 'Informe a data de início.';
    }

    if (!dataFim) {
        erros.dataFim = 'Informe a data de encerramento.';
    }

    if (dataInicio && dataFim && dataFim < dataInicio) {
        erros.dataFim = 'A data de encerramento não pode ser anterior à data de início.';
    }

    //----------------- PÚBLICO -------------------------------//

    if (!publicoSelecionado) {
        erros.publicoSelecionado = 'Selecione o público da avaliação.';
    }

    if (
        publicoSelecionado !== 'TODOS' &&
        itensSelecionados.length === 0
    ) {
        erros.itensSelecionados = 'Selecione pelo menos um setor ou cargo.';
    }

    //----------------- FATORES -------------------------------//

    if (!anonimato && anonimato !== 0) {
        erros.anonimato = '';
    }

    //----------------- RESULTADO -----------------------------//

    return {
        valido: Object.values(erros).every((erro) => !erro),
        erros
    };

}

//----------------- EXPORTAÇÃO -------------------------------//

export default validarAvaliacao;
