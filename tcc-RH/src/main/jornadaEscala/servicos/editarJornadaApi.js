
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


//----------------- ATUALIZAR JORNADA E DIAS ------------------------//

async function editarJornadaApi(idJornada, dadosJornada, diasExistentes) {

    // Atualiza os dados principais da jornada.
    const respostaJornada = await fetch(
        `${API}/jornada_escala/${idJornada}`,
        {
            method: 'PUT',
            headers: obterConfiguracao(),
            body: JSON.stringify({
                nome: dadosJornada.nome,
                descricao: dadosJornada.descricao,
                hora_inicio: dadosJornada.hora_inicio,
                hora_fim: dadosJornada.hora_fim,
                status: Number(dadosJornada.status)
            })
        }
    );

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
            'Não foi possível atualizar a jornada.'
        );
    }

    // Confere se os dias existentes foram encontrados.
    if (!Array.isArray(diasExistentes) || diasExistentes.length === 0) {
        throw new Error(
            'A jornada foi atualizada, mas não foi possível localizar os dias cadastrados.'
        );
    }

    // Atualiza cada dia usando o ID do registro existente.
    for (const dia of dadosJornada.dias) {

        const diaExistente = diasExistentes.find(
            (item) => item.dia_sigla === dia.dia_sigla
        );

        if (!diaExistente || diaExistente.id == null) {
            throw new Error(
                `Não foi possível localizar o registro do dia ${dia.dia_semana}.`
            );
        }

        const respostaDia = await fetch(
            `${API}/dia_semana/${diaExistente.id}`,
            {
                method: 'PUT',
                headers: obterConfiguracao(),
                body: JSON.stringify({
                    id_jornada_escala: Number(idJornada),
                    dia_semana: dia.dia_semana,
                    dia_sigla: dia.dia_sigla,
                    ativo: Number(dia.ativo)
                })
            }
        );

        const resultadoDia = await respostaDia.json();

        if (respostaDia.status === 401) {
            localStorage.removeItem('access_token');
            throw new Error(
                'Sua autenticação expirou. Faça login novamente.'
            );
        }

        if (!respostaDia.ok) {
            throw new Error(
                resultadoDia.message ||
                resultadoDia.mensagem ||
                resultadoDia.error ||
                `Não foi possível atualizar o dia ${dia.dia_semana}.`
            );
        }
    }

    return {
        sucesso: true,
        mensagem: 'Jornada atualizada com sucesso.'
    };
}


//----------------- EXPORTAÇÃO ---------------------------------------//

export default editarJornadaApi;
