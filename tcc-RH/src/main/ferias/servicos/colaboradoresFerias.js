//----------------- CONFIGURAÇÃO DA API --------------------//

const API =
    'http://localhost:8080/v1/senai/avalon';


//----------------- AUTENTICAÇÃO -----------------------------//

function obterConfiguracao() {

    const token =
        localStorage.getItem('access_token');


    if (!token) {

        throw new Error(
            'Token não encontrado. Faça login novamente.'
        );

    }


    return {

        'Authorization':
            `Bearer ${token}`,

        'Content-Type':
            'application/json'

    };

}


//----------------- TRATAR RESPOSTA -------------------------//

async function tratarResposta(
    resposta,
    mensagemPadrao
) {

    let resultado = {};

    try {

        resultado =
            await resposta.json();

    } catch {

        resultado = {};

    }


    if (
        resposta.status === 401
    ) {

        localStorage.removeItem(
            'access_token'
        );

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    if (!resposta.ok) {

        throw new Error(

            resultado.message ||

            resultado.mensagem ||

            resultado.error ||

            mensagemPadrao

        );

    }


    return resultado;

}


//----------------- BUSCAR COLABORADORES -------------------//

export async function buscarColaboradoresFerias() {

    const resposta =
        await fetch(
            `${API}/colaborador`,
            {
                method: 'GET',
                headers: obterConfiguracao()
            }
        );


    return tratarResposta(
        resposta,
        'Não foi possível carregar os colaboradores.'
    );

}


//----------------- BUSCAR USUÁRIOS -------------------------//

export async function buscarUsuariosGestores() {

    const resposta =
        await fetch(
            `${API}/usuario`,
            {
                method: 'GET',
                headers: obterConfiguracao()
            }
        );


    return tratarResposta(
        resposta,
        'Não foi possível carregar os usuários.'
    );

}


//----------------- EXPORTAÇÕES -----------------------------//

export default {

    buscarColaboradoresFerias,

    buscarUsuariosGestores

};