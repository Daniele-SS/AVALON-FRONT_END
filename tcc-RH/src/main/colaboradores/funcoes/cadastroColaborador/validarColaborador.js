
 //----------------- VALIDAR DADOS DO COLABORADOR ----------------//

function validarColaborador(dados) {

    // Nome
    if (!dados.nome || !dados.nome.trim()) {
        alert('Informe o nome completo do colaborador.');
        return false;
    }

    // E-mail
    if (!dados.email || !dados.email.trim()) {
        alert('Informe o e-mail do colaborador.');
        return false;
    }

    const email = dados.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Informe um endereço de e-mail válido.');
        return false;
    }

    // CPF
    const cpf = String(dados.cpf || '').replace(/\D/g, '');

    if (cpf.length !== 11) {
        alert('Informe um CPF com 11 números.');
        return false;
    }

    // Matrícula
    if (!dados.matricula || !String(dados.matricula).trim()) {
        alert('Informe a matrícula do colaborador.');
        return false;
    }

    // Cargo
    if (!dados.idCargo) {
        alert('Selecione um cargo.');
        return false;
    }

    // Setor
    if (!dados.idSetor) {
        alert('Selecione um setor.');
        return false;
    }

    // Tipo de vínculo
    if (!dados.tipoVinculo) {
        alert('Selecione o tipo de vínculo.');
        return false;
    }

    // Jornada
    if (!dados.idJornadaEscala) {
        alert('Selecione uma jornada de trabalho.');
        return false;
    }

    // Nível de acesso
    if (!dados.idNivelAcesso) {
        alert('Selecione o nível de acesso.');
        return false;
    }

    // Login
    if (!dados.login || !dados.login.trim()) {
        alert('Informe o login de acesso.');
        return false;
    }

    // Senha: obrigatória somente no cadastro novo
    if (!dados.senha || !dados.senha.trim()) {
        alert('Informe a senha de acesso.');
        return false;
    }

    return true;
}

export default validarColaborador;
