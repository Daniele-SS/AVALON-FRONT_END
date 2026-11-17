
/********************************************************************************
 * Objetivo: Buscar as respostas dos feedbacks cadastrados.
 ********************************************************************************/

//----------------- API DE RESPOSTAS -----------------//

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


//----------------- BUSCAR RESPOSTAS -----------------//

async function buscarRespostasFeedback() {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(
        `${API}/resposta_feedback`,
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
        throw new Error('Não foi possível carregar as respostas.');
    }


    //----------------- CONVERTER RESPOSTA ------------//

    const dados = await resposta.json();


    //----------------- ORGANIZAR RESPOSTAS -----------//

    const respostas =
        dados.response?.respostas ??
        dados.respostas ??
        [];


    //----------------- CONFERIR NO CONSOLE -----------//

    console.log('Respostas carregadas:', respostas);


    //----------------- RETORNAR DADOS ----------------//

    return respostas;

}


//----------------- EXPORTAÇÃO -----------------------//

export default buscarRespostasFeedback;
