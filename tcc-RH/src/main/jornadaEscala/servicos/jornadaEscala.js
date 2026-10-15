//----------------- API DE JORNADA E ESCALA -----------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR DADOS ----------------------------//

async function buscarDadosJornadaEscala() {

    const respostaJornadas = await fetch(
        `${API}/jornada_escala`
    );

    const respostaColaboradores = await fetch(
        `${API}/colaborador`
    );

    const respostaDiasSemana = await fetch(
        `${API}/dia_semana`
    );


    //----------------- VALIDAR RESPOSTAS -------------------//

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


    //----------------- MOSTRAR DADOS COMPLETOS -------------//



    //----------------- RETORNAR DADOS ----------------------//

    return {
        jornadas: dadosJornadas.response?.jornadaEscala || [],
        colaboradores: dadosColaboradores.response?.colaborador || [],
        diasSemana: dadosDiasSemana.response?.diaSemana || []
    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosJornadaEscala;