
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

    const respostaJornadas = await fetch(
        `${API}/jornada_escala`,
        { headers: configuracao }
    );

    const respostaColaboradores = await fetch(
        `${API}/colaborador`,
        { headers: configuracao }
    );

    const respostaDiasSemana = await fetch(
        `${API}/dia_semana`,
        { headers: configuracao }
    );

    // Verifica se a autenticação expirou.
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

    if (!respostaJornadas.ok) {
        throw new Error('Não foi possível carregar as jornadas.');
    }

    if (!respostaColaboradores.ok) {
        throw new Error('Não foi possível carregar os colaboradores.');
    }

    if (!respostaDiasSemana.ok) {
        throw new Error('Não foi possível carregar os dias da semana.');
    }

    const dadosJornadas = await respostaJornadas.json();
    const dadosColaboradores = await respostaColaboradores.json();
    const dadosDiasSemana = await respostaDiasSemana.json();

    return {
        jornadas: dadosJornadas.response?.jornadaEscala || [],
        colaboradores: dadosColaboradores.response?.colaborador || [],
        diasSemana: dadosDiasSemana.response?.diaSemana || []
    };
}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosJornadaEscala;
