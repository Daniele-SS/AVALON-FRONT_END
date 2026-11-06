//----------------- VALIDAR DOCUMENTO -----------------------//

export function validarDocumento(dados) {

    const erros = {};


    //----------------- NOME -------------------------------//

    if (!dados.nome || !dados.nome.trim()) {

        erros.nome = 'Informe o nome do documento.';

    } else if (dados.nome.trim().length < 2) {

        erros.nome = 'O nome deve possuir pelo menos 2 caracteres.';

    }


    //----------------- TIPO DO DOCUMENTO ------------------//

    if (!dados.tipoDocumento) {

        erros.tipoDocumento = 'Selecione o tipo do documento.';

    }


    //----------------- COLABORADOR ------------------------//

    if (!dados.idColaborador) {

        erros.idColaborador = 'Selecione um colaborador.';

    }


    //----------------- ARQUIVO ----------------------------//

    if (!dados.arquivo) {

        erros.arquivo = 'Selecione um arquivo para o documento.';

    } else {

        const erroArquivo = validarArquivoDocumento(dados.arquivo);

        if (erroArquivo) {
            erros.arquivo = erroArquivo;
        }

    }

    return erros;

}


//----------------- VALIDAR ARQUIVO -------------------------//

export function validarArquivoDocumento(arquivo) {

    const extensoesPermitidas = [
        'pdf',
        'doc',
        'docx',
        'jpg',
        'jpeg',
        'png'
    ];

    const extensao = arquivo.name
        .split('.')
        .pop()
        .toLowerCase();

    const tamanhoMaximo = 25 * 1024 * 1024;


    if (!extensoesPermitidas.includes(extensao)) {

        return 'Formato inválido. Selecione PDF, DOC, DOCX, JPG ou PNG.';

    }


    if (arquivo.size > tamanhoMaximo) {

        return 'O arquivo deve possuir no máximo 25 MB.';

    }


    if (arquivo.size === 0) {

        return 'O arquivo selecionado está vazio.';

    }

    return '';

}