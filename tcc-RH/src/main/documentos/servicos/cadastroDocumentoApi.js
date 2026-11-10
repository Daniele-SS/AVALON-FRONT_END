
//----------------- CONFIGURAÇÃO DA API ---------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO -----------------//

function obterConfiguracao() {

    const token = localStorage.getItem('access_token');

    if (!token) {

        throw new Error(
            'Token não encontrado. Faça login novamente.'
        );

    }

    return {
        'Authorization': `Bearer ${token}`
    };

}


//----------------- CADASTRAR DOCUMENTO ---------------------//

export async function cadastrarDocumento(dadosDocumento) {

    const resposta = await fetch(`${API}/documento`, {

        method: 'POST',

        headers: obterConfiguracao(),

        // Envia os dados e o arquivo físico.
        // O navegador configura automaticamente o multipart/form-data.

        body: dadosDocumento

    });


    //----------------- CONVERTER RESPOSTA -----------------//

    const resultado = await resposta.json();


    //----------------- AUTENTICAÇÃO ------------------------//

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    //----------------- VALIDAR RESPOSTA --------------------//

    if (!resposta.ok) {

        throw new Error(
            resultado.message ||
            resultado.mensagem ||
            resultado.error ||
            'Não foi possível cadastrar o documento.'
        );

    }


    //----------------- RETORNAR RESULTADO ------------------//

    return {

        sucesso: true,

        documento:
            resultado.response || resultado,

        mensagem:
            resultado.message ||
            'Documento cadastrado com sucesso.'

    };

}
