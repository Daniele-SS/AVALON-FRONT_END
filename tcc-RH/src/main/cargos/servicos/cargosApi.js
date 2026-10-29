
//----------------- API DOS CARGOS --------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO -----------------//

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


//----------------- BUSCAR DADOS ----------------------------//

async function buscarDadosCargos() {

    const configuracao = obterConfiguracao();

    const respostaCargos = await fetch(`${API}/cargo`, {
        method: 'GET',
        headers: configuracao
    });

    const respostaColaboradores = await fetch(`${API}/colaborador`, {
        method: 'GET',
        headers: configuracao
    });

    const respostaSetores = await fetch(`${API}/setor`, {
        method: 'GET',
        headers: configuracao
    });


    // Verifica se a autenticação expirou.

    if (
        respostaCargos.status === 401 ||
        respostaColaboradores.status === 401 ||
        respostaSetores.status === 401
    ) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    // Verifica se alguma requisição falhou.

    if (
        !respostaCargos.ok ||
        !respostaColaboradores.ok ||
        !respostaSetores.ok
    ) {

        throw new Error(
            'Não foi possível carregar os dados dos cargos.'
        );

    }


    // Converte as respostas para JSON.

    const dadosCargos = await respostaCargos.json();
    const dadosColaboradores = await respostaColaboradores.json();
    const dadosSetores = await respostaSetores.json();

    

    // Retorna os dados para a tela.


    // Retorna os dados para a tela.
    return {
        cargos: dadosCargos.response?.cargos || [],
        colaboradores: dadosColaboradores.response?.colaborador || [],
        setores: dadosSetores.response?.setor || []
    };


}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosCargos;
