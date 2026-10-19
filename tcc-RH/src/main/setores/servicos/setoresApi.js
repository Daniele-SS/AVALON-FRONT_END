
 //----------------- API DOS SETORES -------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR DADOS ----------------------------//

async function buscarDadosSetores() {

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

    // Busca os dados enviando o token.
    const respostaSetores = await fetch(
        `${API}/setor`,
        configuracao
    );

    const respostaColaboradores = await fetch(
        `${API}/colaborador`,
        configuracao
    );

    const respostaUsuarios = await fetch(
        `${API}/usuario`,
        configuracao
    );

    // Verifica se alguma requisição foi recusada.
    if (
        respostaSetores.status === 401 ||
        respostaColaboradores.status === 401 ||
        respostaUsuarios.status === 401
    ) {
        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );
    }

    // Verifica se alguma requisição falhou.
    if (
        !respostaSetores.ok ||
        !respostaColaboradores.ok ||
        !respostaUsuarios.ok
    ) {
        throw new Error(
            'Não foi possível carregar os dados. Verifique suas permissões.'
        );
    }

    // Converte as respostas para JSON.
    const dadosSetores = await respostaSetores.json();
    const dadosColaboradores = await respostaColaboradores.json();
    const dadosUsuarios = await respostaUsuarios.json();

    // Retorna os dados para a tela.
    return {
        setores: dadosSetores.response?.setor || [],
        colaboradores: dadosColaboradores.response?.colaborador || [],
        usuarios: dadosUsuarios.response?.usuario || []
    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosSetores;
