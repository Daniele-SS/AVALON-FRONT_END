//----------------- VALIDAR CADASTRO DE CARGO ----------------//

function validarCargo(dadosCargo, cargos = [], idCargoAtual = null) {

    //----------------- NORMALIZAR DADOS --------------------//

    const nome = (dadosCargo.nome || '').trim();
    const codigo = (dadosCargo.codigo || '').trim();
    const descricao = (dadosCargo.descricao || '').trim();


    //----------------- ARMAZENAR ERROS ---------------------//

    const erros = {};


    //----------------- VERIFICAR NOME DUPLICADO ------------//

    const nomeDuplicado = cargos.some(cargo => {

        return (
            Number(cargo.id) !== Number(idCargoAtual) &&
            (cargo.nome || '').trim().toLowerCase() === nome.toLowerCase()
        );

    });


    //----------------- VERIFICAR CÓDIGO DUPLICADO ----------//

    const codigoDuplicado = cargos.some(cargo => {

        return (
            Number(cargo.id) !== Number(idCargoAtual) &&
            (cargo.codigo || '').trim().toLowerCase() === codigo.toLowerCase()
        );

    });


    //----------------- VALIDAR NOME -------------------------//

    if (nome === '') {

        erros.nome = 'Informe o nome do cargo';

    } else if (nome.length > 150) {

        erros.nome = 'O nome deve ter no máximo 150 caracteres';

    } else if (nomeDuplicado) {

        erros.nome = 'Já existe um cargo com esse nome';

    }


    //----------------- VALIDAR CÓDIGO -----------------------//

    if (codigo === '') {

        erros.codigo = 'Informe o código do cargo';

    } else if (codigo.length > 10) {

        erros.codigo = 'O código deve ter no máximo 10 caracteres';

    } else if (codigoDuplicado) {

        erros.codigo = 'Já existe um cargo com esse código';

    }


    //----------------- VALIDAR DESCRIÇÃO --------------------//

    if (descricao.length > 300) {

        erros.descricao = 'A descrição deve ter no máximo 300 caracteres';

    }


    //----------------- VALIDAR STATUS -----------------------//

    if (
        dadosCargo.status !== 0 &&
        dadosCargo.status !== 1 &&
        dadosCargo.status !== '0' &&
        dadosCargo.status !== '1'
    ) {

        erros.status = 'Selecione um status válido';

    }


    //----------------- RESULTADO ----------------------------//

    return {

        valido: Object.keys(erros).length === 0,

        erros,

        nomeValido: !erros.nome,
        codigoValido: !erros.codigo,

        nomeDuplicado,
        codigoDuplicado,

        erroNome: erros.nome || '',
        erroCodigo: erros.codigo || '',

        nomeComErro: Boolean(erros.nome),
        codigoComErro: Boolean(erros.codigo)

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default validarCargo;