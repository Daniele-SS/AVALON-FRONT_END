
 //--------------- MONTAR DADOS DO COLABORADOR ----------------//

// Retorna a data atual no formato esperado pela API.
function obterDataAtual() {
    const data = new Date();

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

// Organiza os dados antes de cadastrar o colaborador.
function montarDadosColaborador(dados) {
    return {
        matricula: dados.matricula.trim(),
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        cpf: dados.cpf.replace(/\D/g, ''),
        telefone: dados.telefone
            ? dados.telefone.replace(/\D/g, '')
            : null,
        data_nascimento: dados.dataNascimento || null,
        data_admissao: obterDataAtual(),
        data_desligamento: dados.dataDesligamento || null,
        status: Number(dados.status) === 1 ? 'Ativo' : 'Inativo',
        id_cargo: Number(dados.idCargo),
        id_setor: Number(dados.idSetor),
        id_jornada_escala: Number(dados.idJornadaEscala),
        tipo_vinculo: dados.tipoVinculo
    };
}

export default montarDadosColaborador;
