
/********************************************************************************
 * Objetivo: Arquivo responsável por buscar os dados utilizados no
 *           acompanhamento dos resultados das pesquisas.
 *
 * APIs utilizadas:
 *           GET /pergunta
 *           GET /resposta
 *           GET /pesquisa_resultado
 ********************************************************************************/


//----------------- URL DA API --------------------------------//

const URL_API = 'http://localhost:8080/v1/senai/avalon';


//----------------- REALIZAR REQUISIÇÃO ----------------------//

async function realizarRequisicao(endpoint) {

    // Recupera o token de autenticação
    const token = localStorage.getItem('access_token');

    // Realiza a requisição para a API
    const resposta = await fetch(`${URL_API}${endpoint}`, {
        method: 'GET',

        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    // Verifica se a requisição foi realizada corretamente
    if (!resposta.ok) {

        if (resposta.status === 401) {
            localStorage.removeItem('access_token');
        }

        throw new Error(
            `Erro ao buscar dados da API. Status: ${resposta.status}`
        );
    }

    // Converte a resposta para JSON
    const dados = await resposta.json();

    // Retorna os dados recebidos da API
    return dados.response;

}


//----------------- LISTAR PERGUNTAS -------------------------//

export async function listarPerguntas() {

    const dados = await realizarRequisicao('/pergunta');

    // Retorna a lista de perguntas
    return dados?.perguntas || [];

}


//----------------- LISTAR RESPOSTAS -------------------------//

export async function listarRespostas() {

    const dados = await realizarRequisicao('/resposta');

    // Retorna a lista de respostas
    return dados?.respostas || [];

}


//----------------- LISTAR RESULTADOS ------------------------//

export async function listarPesquisaResultados() {

    const dados = await realizarRequisicao('/pesquisa_resultado');

    // Retorna os resultados consolidados da pesquisa
    return dados?.pesquisaResultados || [];

}
