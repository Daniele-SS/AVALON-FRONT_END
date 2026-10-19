
 //----------------- CONFIGURAÇÃO DA API -----------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO --------------------------//

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


//----------------- CADASTRAR JORNADA -------------------------------//

export async function cadastrarJornadaEscala(dadosJornada) {

    const respostaJornada = await fetch(`${API}/jornada_escala`, {
        method: 'POST',
        headers: obterConfiguracao(),
        body: JSON.stringify({
            nome: dadosJornada.nome,
            descricao: dadosJornada.descricao,
            hora_inicio: dadosJornada.hora_inicio,
            hora_fim: dadosJornada.hora_fim,
            status: Number(dadosJornada.status)
        })
    });

    const resultadoJornada = await respostaJornada.json();

    if (respostaJornada.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua autenticação expirou. Faça login novamente.');
    }

    if (!respostaJornada.ok) {
        throw new Error(
            resultadoJornada.message ||
            resultadoJornada.mensagem ||
            resultadoJornada.error ||
            'Não foi possível cadastrar a jornada.'
        );
    }

    const jornadaCriada =
        resultadoJornada.response?.jornadaEscala ||
        resultadoJornada.response ||
        resultadoJornada;

    const idJornada = jornadaCriada.id ?? resultadoJornada.id;

    if (idJornada == null || idJornada === '') {
        throw new Error(
            'A jornada foi cadastrada, mas a API não retornou seu ID.'
        );
    }

    if (!Array.isArray(dadosJornada.dias)) {
        const erro = new Error(
            'A jornada foi cadastrada, mas a lista de dias da semana é inválida.'
        );

        erro.jornadaCriada = true;
        erro.idJornada = idJornada;

        throw erro;
    }


    //----------------- CADASTRAR DIAS DA SEMANA ---------------------//

    for (const dia of dadosJornada.dias) {

        let respostaDia;

        try {
            respostaDia = await fetch(`${API}/dia_semana`, {
                method: 'POST',
                headers: obterConfiguracao(),
                body: JSON.stringify({
                    id_jornada_escala: Number(idJornada),
                    dia_semana: dia.dia_semana,
                    dia_sigla: dia.dia_sigla,
                    ativo: Number(dia.ativo)
                })
            });
        } catch {
            const erro = new Error(
                `Não foi possível cadastrar o dia ${dia.dia_semana}.`
            );

            erro.jornadaCriada = true;
            erro.idJornada = idJornada;

            throw erro;
        }

        if (respostaDia.status === 401) {
            localStorage.removeItem('access_token');

            const erro = new Error(
                'Sua autenticação expirou. Faça login novamente.'
            );

            erro.jornadaCriada = true;
            erro.idJornada = idJornada;

            throw erro;
        }

        if (!respostaDia.ok) {
            const erro = new Error(
                `Não foi possível cadastrar o dia ${dia.dia_semana}.`
            );

            erro.jornadaCriada = true;
            erro.idJornada = idJornada;

            throw erro;
        }
    }

    return {
        sucesso: true,
        idJornada,
        mensagem: 'Jornada cadastrada com sucesso.'
    };
}
