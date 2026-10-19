
const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONVERTER DATA --------------------------//

// Converte uma data para o formato aceito pelo MySQL: YYYY-MM-DD

function formatarData(data) {

    if (!data) {
        return null;
    }

    return String(data).split('T')[0];

}


//----------------- REQUISIÇÃO À API ------------------------//

// Função para enviar requisições PUT para a API

async function requisicaoApi(rota, dados) {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error(
            'Token não encontrado. Faça login novamente.'
        );
    }

    const resposta = await fetch(`${API}${rota}`, {

        method: 'PUT',

        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },

        body: JSON.stringify(dados)

    });

    const texto = await resposta.text();

    let resultado = {};

    try {

        resultado = texto ? JSON.parse(texto) : {};

    } catch {

        resultado = {
            mensagem: texto
        };

    }

    console.log('Rota:', `${API}${rota}`);
    console.log('Status HTTP:', resposta.status);
    console.log('Resposta da API:', resultado);

    // Verifica se a autenticação expirou.

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }

    // Verifica se a API retornou algum erro.

    if (
        !resposta.ok ||
        resultado.status === false ||
        resultado.success === false ||
        Number(resultado.status_code) >= 400
    ) {

        throw new Error(
            resultado.mensagem ||
            resultado.message ||
            resultado.erro ||
            resultado.error ||
            'Não foi possível atualizar os dados.'
        );

    }

    return resultado;

}


//----------------- EDITAR COLABORADOR ----------------------//

// Atualiza os dados do colaborador.

export async function editarColaborador(
    idColaborador,
    dados,
    colaborador
) {

    if (!idColaborador) {

        throw new Error(
            'Não foi possível identificar o colaborador.'
        );

    }

    const dadosColaborador = {

        matricula: dados.matricula.trim(),

        nome: dados.nome.trim(),

        email: dados.email.trim(),

        cpf: dados.cpf.replace(/\D/g, ''),

        telefone: dados.telefone
            ? dados.telefone.replace(/\D/g, '')
            : null,

        data_nascimento: formatarData(
            dados.dataNascimento
        ),

        data_admissao: formatarData(
            colaborador.data_admissao
        ),

        data_desligamento: formatarData(
            dados.dataDesligamento
        ),

        status: Number(dados.status) === 1
            ? 'Ativo'
            : 'Inativo',

        id_cargo: Number(dados.idCargo),

        id_setor: Number(dados.idSetor),

        id_jornada_escala: Number(
            dados.idJornadaEscala
        ),

        tipo_vinculo: dados.tipoVinculo

    };

    console.log(
        'Dados do colaborador enviados:',
        dadosColaborador
    );

    return await requisicaoApi(
        `/colaborador/${idColaborador}`,
        dadosColaborador
    );

}


//----------------- EDITAR USUÁRIO --------------------------//

// Atualiza os dados de acesso do usuário.
// A senha só é enviada quando uma nova senha é informada.

export async function editarUsuario(
    idUsuario,
    dados,
    idColaborador,
    usuario
) {

    if (!idUsuario) {

        throw new Error(
            'Não foi possível identificar o usuário de acesso.'
        );

    }

    const dadosUsuario = {

        id_colaborador: Number(idColaborador),

        id_nivel_acesso: Number(
            dados.idNivelAcesso
        ),

        login: dados.login.trim()

    };

    // Só inclui a senha se o usuário digitou uma nova senha.

    if (dados.senha && dados.senha.trim() !== '') {

        dadosUsuario.senha = dados.senha.trim();

    }

    console.log(
        'Dados de acesso enviados para edição:',
        {
            ...dadosUsuario,
            senha: dadosUsuario.senha ? '[NOVA SENHA INFORMADA]' : '[SENHA NÃO ALTERADA]'
        }
    );

    return await requisicaoApi(
        `/usuario/${idUsuario}`,
        dadosUsuario
    );

}
