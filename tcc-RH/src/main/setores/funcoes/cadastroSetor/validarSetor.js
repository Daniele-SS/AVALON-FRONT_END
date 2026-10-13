//----------------- VALIDAR SETOR ---------------------------//

function validarSetor(nome, codigo, setores) {

    const nomeFormatado = nome.trim().toLowerCase();
    const codigoFormatado = codigo.trim().toLowerCase();

    const nomeValido = nome.trim() !== '';
    const codigoValido = codigo.trim() !== '';


    //----------------- VERIFICAR DUPLICIDADE ----------------//

    const nomeDuplicado = setores.some(setor =>
        (setor.nome || '').trim().toLowerCase() === nomeFormatado
    );

    const codigoDuplicado = setores.some(setor =>
        String(setor.codigo || '').trim().toLowerCase() === codigoFormatado
    );


    //----------------- RETORNO -------------------------------//

    return {
        nomeValido,
        codigoValido,
        nomeDuplicado,
        codigoDuplicado
    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default validarSetor;