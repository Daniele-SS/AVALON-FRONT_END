//----------------- VALIDAR SETOR ---------------------------//

function validarSetor(nome, codigo, setores) {

    //----------------- FORMATAR ----------------------------//

    const nomeFormatado =
        nome.trim().toLowerCase();

    const codigoFormatado =
        codigo.trim().toLowerCase();


    //----------------- VALIDAÇÃO ---------------------------//

    const nomeValido =
        nome.trim() !== '';

    const codigoValido =
        codigo.trim() !== '';


    //----------------- DUPLICIDADE -------------------------//

    const nomeDuplicado = setores.some(setor =>

        (setor.nome || '')
            .trim()
            .toLowerCase() === nomeFormatado

    );


    const codigoDuplicado = setores.some(setor =>

        String(setor.codigo || '')
            .trim()
            .toLowerCase() === codigoFormatado

    );


    //----------------- MENSAGENS ---------------------------//

    let erroNome = '';

    let erroCodigo = '';


    //----------------- NOME -------------------------------//

    if (!nomeValido) {

        erroNome =
            'Informe o nome do setor';

    } else if (nomeDuplicado) {

        erroNome =
            'Este nome de setor já está cadastrado';

    }


    //----------------- CÓDIGO -----------------------------//

    if (!codigoValido) {

        erroCodigo =
            'Informe o código do setor';

    } else if (codigoDuplicado) {

        erroCodigo =
            'Este código de setor já está cadastrado';

    }


    //----------------- RETORNO ----------------------------//

    return {

        nomeValido,

        codigoValido,

        nomeDuplicado,

        codigoDuplicado,

        erroNome,

        erroCodigo,

        nomeComErro:
            erroNome !== '',

        codigoComErro:
            erroCodigo !== ''

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default validarSetor;