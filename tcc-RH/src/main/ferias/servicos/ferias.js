//----------------- API DE FÉRIAS -------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';

//----------------- BUSCAR FÉRIAS --------------------------//

async function buscarDadosFerias() {

    // Busca o token salvo durante o login.
    const token = localStorage.getItem('access_token');

    // Verifica se existe um token salvo.
    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    // Configura o cabeçalho de autenticação.
    const configuracao = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    // Busca os dados de férias enviando o token.
    const respostaFerias = await fetch(
        `${API}/ferias`,
        configuracao
    );

    // Verifica se a autenticação expirou.
    if (respostaFerias.status === 401) {
        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );
    }

    // Verifica se a requisição falhou.
    if (!respostaFerias.ok) {
        throw new Error(
            'Não foi possível carregar os dados de férias. Verifique suas permissões.'
        );
    }

    // Converte a resposta para JSON.
    const dadosFerias = await respostaFerias.json();

    // Retorna a lista de férias.
    return {
        ferias: dadosFerias.response?.ferias || []
    };
}

//----------------- EXPORTAÇÃO -----------------------------//

export default buscarDadosFerias;