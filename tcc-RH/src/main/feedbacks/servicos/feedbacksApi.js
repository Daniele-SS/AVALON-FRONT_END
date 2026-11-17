
/********************************************************************************
 * Objetivo: Buscar os feedbacks cadastrados na API.
 ********************************************************************************/

//----------------- API DE FEEDBACKS -----------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO ----------//

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


//----------------- BUSCAR FEEDBACKS -----------------//

async function buscarFeedbacks() {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(
        `${API}/feedback`,
        { headers: configuracao }
    );


    //----------------- VERIFICAR AUTENTICAÇÃO --------//

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );
    }


    //----------------- VERIFICAR RESPOSTA ------------//

    if (!resposta.ok) {
        throw new Error('Não foi possível carregar os feedbacks.');
    }


    //----------------- CONVERTER RESPOSTA ------------//

    const dados = await resposta.json();


    //----------------- ORGANIZAR FEEDBACKS -----------//

    const feedbacks =
        dados.response?.feedbacks ??
        dados.feedbacks ??
        [];


    //----------------- CONFERIR NO CONSOLE -----------//

    console.log('Feedbacks carregados:', feedbacks);


    //----------------- RETORNAR DADOS ----------------//

    return feedbacks;

}


//----------------- EXPORTAÇÃO -----------------------//

export default buscarFeedbacks;
