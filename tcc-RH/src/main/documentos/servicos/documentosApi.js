
//----------------- CONFIGURAÇÃO DA API -----------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR DOCUMENTOS -------------------------------//

async function buscarDocumentos() {

    // Recuperar o token de autenticação.
    const token = localStorage.getItem('access_token');

    // Verificar se existe um token.
    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    // Consultar a API.
    const resposta = await fetch(
        `${API}/documento`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        }
    );

    // Converter a resposta para JSON.
    const dados = await resposta.json();

    // Verificar se ocorreu algum erro.
    if (!resposta.ok || dados.status === false) {

        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível carregar os documentos.'
        );

    }

    // Retornar a lista de documentos.
    return dados.response?.documentos || [];

}


//----------------- EXPORTAÇÃO --------------------------------------//

export default buscarDocumentos;
