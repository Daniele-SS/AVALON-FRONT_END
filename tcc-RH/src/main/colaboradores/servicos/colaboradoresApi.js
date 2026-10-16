//----------------- API DOS COLABORADORES -------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR DADOS ----------------------------//

async function buscarDadosColaboradores() {

    const [respostaColaboradores, respostaUsuarios] = await Promise.all([

        fetch(`${API}/colaborador`),

        fetch(`${API}/usuario`)

    ]);


    //----------------- VALIDAR RESPOSTAS -------------------//

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

export default buscarDadosColaboradores;