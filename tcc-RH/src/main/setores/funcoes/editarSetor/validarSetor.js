//----------------- VALIDAR SETOR ---------------------------//

function validarSetor(
    nome,
    codigo,
    setores,
    idSetor = null,
    descricao = ''
) {

    const nomeFormatado = nome.trim().toLowerCase();
    const codigoFormatado = codigo.trim().toLowerCase();


    //----------------- CAMPOS OBRIGATÓRIOS -----------------//

    const nomeValido = nome.trim() !== '';
    const codigoValido = codigo.trim() !== '';

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
            String(setor.codigo || '').trim().toLowerCase() === codigoFormatado
        );

    });


    //----------------- RESULTADO ----------------------------//

    return {
        nomeValido,
        codigoValido,
        descricaoValida,
        nomeDuplicado,
        codigoDuplicado
    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default validarSetor;