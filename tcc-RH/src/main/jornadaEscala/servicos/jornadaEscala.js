//----------------- API DE JORNADA E ESCALA -----------------//

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

async function buscarDadosJornadaEscala() {

    const configuracao = obterConfiguracao();


    //----------------- BUSCAR JORNADAS ---------------------//

    const respostaJornadas = await fetch(
        `${API}/jornada_escala`,
        { headers: configuracao }
    );


    //----------------- BUSCAR COLABORADORES ----------------//

    const respostaColaboradores = await fetch(
        `${API}/colaborador`,
        { headers: configuracao }
    );


    //----------------- BUSCAR DIAS DA SEMANA ---------------//

    const respostaDiasSemana = await fetch(
        `${API}/dia_semana`,
        { headers: configuracao }
    );


    //----------------- VERIFICAR AUTENTICAÇÃO ---------------//

    if (
        respostaJornadas.status === 401 ||
        respostaColaboradores.status === 401 ||
        respostaDiasSemana.status === 401
    ) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    //----------------- VERIFICAR RESPOSTAS -----------------//

    if (!respostaJornadas.ok) {
        throw new Error('Não foi possível carregar as jornadas.');
    }

    if (!respostaColaboradores.ok) {
        throw new Error('Não foi possível carregar os colaboradores.');
    }

    if (!respostaDiasSemana.ok) {
        throw new Error('Não foi possível carregar os dias da semana.');
    }


    //----------------- CONVERTER RESPOSTAS -----------------//

    const dadosJornadas = await respostaJornadas.json();

    const dadosColaboradores = await respostaColaboradores.json();

    const dadosDiasSemana = await respostaDiasSemana.json();


    //----------------- ORGANIZAR JORNADAS ------------------//

    const jornadas =
        dadosJornadas.response?.jornadaEscala ??
        dadosJornadas.response?.jornadas ??
        dadosJornadas.jornadaEscala ??
        [];


    //----------------- ORGANIZAR COLABORADORES -------------//

    const colaboradores =
        dadosColaboradores.response?.colaborador ??
        dadosColaboradores.response?.colaboradores ??
        dadosColaboradores.colaborador ??
        [];


    //----------------- ORGANIZAR DIAS DA SEMANA ------------//

    const diasSemana =
        dadosDiasSemana.response?.diaSemana ??
        dadosDiasSemana.response?.diasSemana ??
        dadosDiasSemana.diasSemana ??
        dadosDiasSemana.diaSemana ??
        [];


    //----------------- CONFERIR DADOS NO CONSOLE ------------//

    console.log('Jornadas carregadas:', jornadas);

    console.log('Dias da semana carregados:', diasSemana);


    //----------------- RETORNAR DADOS ----------------------//

    return {
        jornadas,
        colaboradores,
        diasSemana
    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosJornadaEscala;