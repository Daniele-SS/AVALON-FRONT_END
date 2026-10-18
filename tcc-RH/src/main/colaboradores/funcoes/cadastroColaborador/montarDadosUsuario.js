
 //--------------- MONTAR DADOS DO USUARIO ----------------//

// Organiza os dados antes de cadastrar o usuário.
function montarDadosUsuario(dados, idColaborador) {
    return {
        id_colaborador: Number(idColaborador),
        id_nivel_acesso: Number(dados.idNivelAcesso),
        login: dados.login.trim(),
        senha: dados.senha
    };
}

export default montarDadosUsuario;
