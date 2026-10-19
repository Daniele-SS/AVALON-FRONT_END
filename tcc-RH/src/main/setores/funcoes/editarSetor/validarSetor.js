//----------------- VALIDAR SETOR ---------------------------//

function validarSetor(
    nome,
    codigo,
    setores = [],
    idSetor = null,
    descricao = ''
) {

    //----------------- NORMALIZAR DADOS --------------------//

    const nomeFormatado = (nome || '').trim().toLowerCase();
    const codigoFormatado = (codigo || '').trim().toUpperCase();


    //----------------- CAMPOS OBRIGATÓRIOS -----------------//

    const nomeValido = nomeFormatado !== '';
    const codigoValido = codigoFormatado !== '';

    const descricaoValida =
        idSetor === null || descricao.trim() !== '';


    //----------------- NOME DUPLICADO ----------------------//

    const nomeDuplicado = setores.some(setor => {

        return (
            Number(setor.id) !== Number(idSetor) &&
            (setor.nome || '').trim().toLowerCase() === nomeFormatado
        );

    });


    //----------------- CÓDIGO DUPLICADO --------------------//

    const codigoDuplicado = setores.some(setor => {

        return (
            Number(setor.id) !== Number(idSetor) &&
            String(setor.codigo || '').trim().toUpperCase() === codigoFormatado
        );

    });


    //----------------- ERRO DO NOME ------------------------//

    let erroNome = '';

    if (!nomeValido) {

        erroNome = 'Informe o nome do setor';

    } else if (nomeDuplicado) {

        erroNome = 'Este nome de setor já está cadastrado';

    }


    //----------------- ERRO DO CÓDIGO ----------------------//

    let erroCodigo = '';

    if (!codigoValido) {

        erroCodigo = 'Informe o código do setor';

    } else if (codigoFormatado.length < 2 || codigoFormatado.length > 6) {

        erroCodigo = 'O código deve ter de 2 a 6 caracteres';

    } else if (codigoDuplicado) {

        erroCodigo = 'Este código de setor já está cadastrado';

    }


    //----------------- RESULTADO ----------------------------//

    return {

        nomeValido: erroNome === '',
        codigoValido: erroCodigo === '',
        descricaoValida,

        nomeDuplicado,
        codigoDuplicado,

        erroNome,
        erroCodigo,

        nomeComErro: erroNome !== '',
        codigoComErro: erroCodigo !== ''

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default validarSetor;