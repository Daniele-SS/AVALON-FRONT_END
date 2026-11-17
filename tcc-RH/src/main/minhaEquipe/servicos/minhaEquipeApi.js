
/********************************************************************************
 * Objetivo: Buscar os colaboradores e usuários para montar a Minha Equipe.
 ********************************************************************************/

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAÇÕES ---------------------------//

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

async function buscarDadosEquipe() {

    const configuracao = obterConfiguracao();

    const [
        respostaColaboradores,
        respostaUsuarios
    ] = await Promise.all([

        fetch(`${API}/colaborador`, {
            method: 'GET',
            headers: configuracao
        }),

        fetch(`${API}/usuario`, {
            method: 'GET',
            headers: configuracao
        })

    ]);


    //----------------- VERIFICAR AUTENTICAÇÃO ---------------//

    if (
        respostaColaboradores.status === 401 ||
        respostaUsuarios.status === 401
    ) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );
    }


    //----------------- VERIFICAR RESPOSTAS -----------------//

    if (!respostaColaboradores.ok) {
        throw new Error('Não foi possível carregar os colaboradores.');
    }

    if (!respostaUsuarios.ok) {
        throw new Error('Não foi possível carregar os usuários.');
    }


    //----------------- CONVERTER RESPOSTAS -----------------//

    const dadosColaboradores = await respostaColaboradores.json();

    const dadosUsuarios = await respostaUsuarios.json();


    //----------------- RETORNAR DADOS ----------------------//

    return {

        colaboradores:
            dadosColaboradores.response?.colaborador || [],

        usuarios:
            dadosUsuarios.response?.usuario || []

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosEquipe;
