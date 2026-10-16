//----------------- VALIDAR EDIÇÃO DE CARGO -----------------//

function validarCargo(dadosCargo, cargos, idCargo) {
    const erros = {};

    const nome = (dadosCargo.nome || '').trim();
    const codigo = (dadosCargo.codigo || '').trim();
    const descricao = (dadosCargo.descricao || '').trim();

    // Validar nome
    if (nome === '') {
        erros.nome = 'O nome do cargo é obrigatório.';
    } else if (nome.length > 150) {
        erros.nome = 'O nome deve ter no máximo 150 caracteres.';
    } else if (
        cargos.some(cargo =>
            Number(cargo.id) !== Number(idCargo) &&
            (cargo.nome || '').toLowerCase() === nome.toLowerCase()
        )
    ) {
        erros.nome = 'Já existe um cargo com esse nome.';
    }

    // Validar código
    if (codigo === '') {
        erros.codigo = 'O código do cargo é obrigatório.';
    } else if (codigo.length > 10) {
        erros.codigo = 'O código deve ter no máximo 10 caracteres.';
    } else if (
        cargos.some(cargo =>
            Number(cargo.id) !== Number(idCargo) &&
            (cargo.codigo || '').toLowerCase() === codigo.toLowerCase()
        )
    ) {
        erros.codigo = 'Já existe um cargo com esse código.';
    }

    // Validar descrição
    else if (descricao.length > 300) {
        erros.descricao = 'A descrição deve ter no máximo 255 caracteres.';
    }

    // Validar status
    if (
        dadosCargo.status !== 0 &&
        dadosCargo.status !== 1 &&
        dadosCargo.status !== '0' &&
        dadosCargo.status !== '1'
    ) {
        erros.status = 'Selecione um status válido.';
    }

    return {
        valido: Object.keys(erros).length === 0,
        erros
    };
}

//----------------- EXPORTAÇÃO ------------------------------//

export default validarCargo;