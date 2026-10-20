//----------------- API DOS COLABORADORES -------------------//

const API =
    'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO -----------------//

function obterConfiguracao() {

    const token =
        localStorage.getItem('access_token');

    if (!token) {
        throw new Error(
            'Token não encontrado. Faça login novamente.'
        );
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}


//----------------- BUSCAR DADOS ----------------------------//

async function buscarDadosColaboradores() {

    const configuracao =
        obterConfiguracao();

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


    //----------------- AUTENTICAÇÃO ------------------------//

    if (
        respostaColaboradores.status === 401 ||
        respostaUsuarios.status === 401
    ) {

        localStorage.removeItem(
            'access_token'
        );

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );
    }


    //----------------- VALIDAR COLABORADORES ---------------//

    if (!respostaColaboradores.ok) {

        const erro =
            await respostaColaboradores.text();

        console.error(
            'Erro API /colaborador:',
            erro
        );

        throw new Error(
            'Não foi possível carregar os colaboradores.'
        );
    }


    //----------------- VALIDAR USUÁRIOS --------------------//

    if (!respostaUsuarios.ok) {

        const erro =
            await respostaUsuarios.text();

        console.error(
            'Erro API /usuario:',
            erro
        );

        throw new Error(
            'Não foi possível carregar os usuários.'
        );
    }


    //----------------- CONVERTER RESPOSTAS -----------------//

    const dadosColaboradores =
        await respostaColaboradores.json();

    const dadosUsuarios =
        await respostaUsuarios.json();


    //----------------- DEBUG -------------------------------//

    console.log(
        '========== API COLABORADORES =========='
    );

    console.log(
        'Resposta completa:',
        dadosColaboradores
    );

    console.log(
        'Colaboradores:',
        dadosColaboradores.response?.colaborador
    );


    console.log(
        '========== API USUÁRIOS =========='
    );

    console.log(
        'Resposta completa:',
        dadosUsuarios
    );

    console.log(
        'Usuários:',
        dadosUsuarios.response?.usuario
    );


    //----------------- RETORNAR DADOS ----------------------//

    return {

        colaboradores:
            dadosColaboradores.response?.colaborador ||
            [],

        usuarios:
            dadosUsuarios.response?.usuario ||
            []

    };
}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosColaboradores;