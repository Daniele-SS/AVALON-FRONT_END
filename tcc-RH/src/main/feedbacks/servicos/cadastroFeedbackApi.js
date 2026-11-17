
/********************************************************************************
 * Objetivo: Buscar colaboradores ativos e cadastrar feedbacks na API.
 ********************************************************************************/

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO --------------//

function obterConfiguracao() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

}


//----------------- TRATAR RESPOSTA ----------------------//

async function tratarResposta(resposta, mensagemErro) {

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {

        throw new Error(
            dados.message || mensagemErro
        );

    }

    return dados;

}


//----------------- BUSCAR COLABORADORES ATIVOS ----------//

export async function buscarColaboradoresAtivos() {

    const resposta = await fetch(
        `${API}/colaborador`,
        {
            method: 'GET',
            headers: obterConfiguracao()
        }
    );

    const dados = await tratarResposta(
        resposta,
        'Não foi possível buscar os colaboradores.'
    );

    const colaboradores =
        dados.response?.colaboradores ??
        dados.response?.colaborador ??
        dados.colaboradores ??
        dados.colaborador ??
        [];

    const usuarioSalvo = localStorage.getItem('usuario');

    if (!usuarioSalvo) {
        throw new Error('Não foi possível identificar o usuário autenticado.');
    }

    const usuario = JSON.parse(usuarioSalvo);

    const idRemetente = Number(usuario.id_colaborador);

    return colaboradores.filter(colaborador => {

        const ativo = String(colaborador.status)
            .trim()
            .toLowerCase() === 'ativo';

        const naoEhRemetente =
            Number(colaborador.id) !== idRemetente;

        return ativo && naoEhRemetente;

    });

}


//----------------- CADASTRAR FEEDBACK -------------------//

export async function cadastrarFeedback(feedback) {

    const resposta = await fetch(
        `${API}/feedback`,
        {
            method: 'POST',
            headers: obterConfiguracao(),
            body: JSON.stringify(feedback)
        }
    );

    const dados = await tratarResposta(
        resposta,
        'Não foi possível cadastrar o feedback.'
    );

    return dados.response;

}
