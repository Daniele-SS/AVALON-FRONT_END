
 //----------------- VALIDAR DADOS DO COLABORADOR ----------------//

function validarColaborador(dados, modoEdicao = false) {

    // Guardar os erros encontrados
    const erros = {};

    // Tratar os valores recebidos
    const nome = String(dados.nome || '').trim();
    const email = String(dados.email || '').trim();
    const cpf = String(dados.cpf || '').replace(/\D/g, '');
    const matricula = String(dados.matricula || '').trim();
    const login = String(dados.login || '').trim();
    const senha = String(dados.senha || '');

    //----------------- NOME -----------------------------//

    if (nome === '') {
        erros.nome = 'Informe o nome completo do colaborador.';
    } else if (nome.length > 100) {
        erros.nome = 'O nome deve ter no máximo 100 caracteres.';
    }

    //----------------- E-MAIL ---------------------------//

    if (email === '') {
        erros.email = 'Informe o e-mail do colaborador.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        erros.email = 'Informe um endereço de e-mail válido.';
    } else if (email.length > 150) {
        erros.email = 'O e-mail deve ter no máximo 150 caracteres.';
    }

    //----------------- CPF ------------------------------//

    if (cpf === '') {
        erros.cpf = 'Informe o CPF do colaborador.';
    } else if (cpf.length !== 11) {
        erros.cpf = 'O CPF deve conter 11 números.';
    } else if (/^(\d)\1{10}$/.test(cpf)) {
        erros.cpf = 'Informe um CPF válido.';
    } else {
        // Validar o primeiro dígito verificador
        let soma = 0;

        for (let i = 0; i < 9; i++) {
            soma += Number(cpf[i]) * (10 - i);
        }

        let resto = (soma * 10) % 11;

        if (resto === 10) {
            resto = 0;
        }

        if (resto !== Number(cpf[9])) {
            erros.cpf = 'O CPF informado não é válido.';
        } else {
            // Validar o segundo dígito verificador
            soma = 0;

            for (let i = 0; i < 10; i++) {
                soma += Number(cpf[i]) * (11 - i);
            }

            resto = (soma * 10) % 11;

            if (resto === 10) {
                resto = 0;
            }

            if (resto !== Number(cpf[10])) {
                erros.cpf = 'O CPF informado não é válido.';
            }
        }
    }

    //----------------- MATRÍCULA ------------------------//

    if (matricula === '') {
        erros.matricula = 'Informe a matrícula do colaborador.';
    }

    //----------------- CARGO ----------------------------//

    if (!dados.idCargo) {
        erros.idCargo = 'Selecione um cargo.';
    }

    //----------------- SETOR ----------------------------//

    if (!dados.idSetor) {
        erros.idSetor = 'Selecione um setor.';
    }

    //----------------- TIPO DE VÍNCULO ------------------//

    if (!dados.tipoVinculo) {
        erros.tipoVinculo = 'Selecione o tipo de vínculo.';
    }

    //----------------- LOGIN ----------------------------//

    if (login === '') {
        erros.login = 'Informe o login de acesso.';
    }

    //----------------- SENHA ----------------------------//

    if (!modoEdicao && senha.trim() === '') {
        erros.senha = 'Informe a senha de acesso.';
    }

    //----------------- NÍVEL DE ACESSO -------------------//

    if (!dados.idNivelAcesso) {
        erros.idNivelAcesso = 'Selecione o nível de acesso.';
    }

    //----------------- JORNADA --------------------------//

    if (!dados.idJornadaEscala) {
        erros.idJornadaEscala = 'Selecione uma jornada de trabalho.';
    }

    //----------------- RESULTADO ------------------------//

    return {
        valido: Object.keys(erros).length === 0,
        erros
    };
}

//----------------- EXPORTAÇÃO ----------------------------//

export default validarColaborador;
