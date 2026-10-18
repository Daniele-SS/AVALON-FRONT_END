
 //----------------- VALIDAR DADOS DO COLABORADOR ----------------//

function validarColaborador(dados) {

    //----------------- NOME -------------------------------//

    if (!dados.nome.trim()) {
        alert('Informe o nome completo do colaborador.');
        return false;
    }


    //----------------- E-MAIL -----------------------------//

    if (!dados.email.trim()) {
        alert('Informe o e-mail do colaborador.');
        return false;
    }

    const email = dados.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Informe um endereço de e-mail válido.');
        return false;
    }


    //----------------- CPF --------------------------------//

    const cpf = dados.cpf.replace(/\D/g, '');

    if (cpf.length !== 11) {
        alert('Informe um CPF com 11 números.');
        return false;
    }


    //----------------- MATRÍCULA --------------------------//

    if (!dados.matricula.trim()) {
        alert('Informe a matrícula do colaborador.');
        return false;
    }


    //----------------- CARGO ------------------------------//

    if (!dados.idCargo) {
        alert('Selecione um cargo.');
        return false;
    }


    //----------------- SETOR ------------------------------//

    if (!dados.idSetor) {
        alert('Selecione um setor.');
        return false;
    }


    //----------------- TIPO DE VÍNCULO --------------------//

    if (!dados.tipoVinculo) {
        alert('Selecione o tipo de vínculo.');
        return false;
    }


    //----------------- JORNADA ----------------------------//

    if (!dados.idJornadaEscala) {
        alert('Selecione uma jornada de trabalho.');
        return false;
    }


    //----------------- NÍVEL DE ACESSO --------------------//

    if (!dados.idNivelAcesso) {
        alert('Selecione o nível de acesso.');
        return false;
    }


    //----------------- LOGIN ------------------------------//

    if (!dados.login.trim()) {
        alert('Informe o login de acesso.');
        return false;
    }


    //----------------- SENHA ------------------------------//

    if (!dados.senha.trim()) {
        alert('Informe a senha de acesso.');
        return false;
    }


    //----------------- DADOS VÁLIDOS ----------------------//

    return true;

}


//----------------- EXPORTAÇÃO ------------------------------//

export default validarColaborador;
