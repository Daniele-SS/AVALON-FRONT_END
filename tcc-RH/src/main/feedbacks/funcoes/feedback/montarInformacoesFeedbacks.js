
/********************************************************************************
 * Objetivo: Organizar os feedbacks e relacionar as respostas aos destinatários.
 ********************************************************************************/

function obterIniciais(nome) {

    if (!nome) return '??';

    return nome
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0].toUpperCase())
        .join('');

}


function organizarColaborador(colaborador) {

    const dados = Array.isArray(colaborador)
        ? colaborador[0]
        : colaborador;

    if (!dados) {

        return {
            id: null,
            nome: 'Colaborador não identificado',
            iniciais: '??',
            cargo: 'Cargo não informado',
            setor: 'Setor não informado'
        };

    }

    return {

        id: dados.id,

        nome: dados.nome,

        iniciais: obterIniciais(dados.nome),

        cargo: dados.cargo?.nome ?? 'Cargo não informado',

        setor: dados.setor?.[0]?.nome ?? 'Setor não informado'

    };

}


function formatarTipo(tipo) {

    const tipos = {

        RECONHECIMENTO: 'Reconhecimento',
        DESENVOLVIMENTO: 'Desenvolvimento',
        COMUNICACAO: 'Comunicação',
        COMUNICAÇÃO: 'Comunicação',
        COLABORACAO: 'Colaboração',
        COLABORAÇÃO: 'Colaboração'

    };

    return tipos[tipo] ?? tipo ?? 'Não informado';

}


function formatarData(data) {

    if (!data) return '';

    return new Date(data).toLocaleDateString('pt-BR', {

        day: '2-digit',
        month: 'long',
        year: 'numeric'

    });

}


function montarInformacoesFeedbacks(feedbacks, respostas) {

    const informacoes = feedbacks.map(feedback => {

        const remetente = organizarColaborador(
            feedback.colaborador_remetente
        );

        const destinatario = organizarColaborador(
            feedback.colaborador_destinatario
        );


        //----------------- LOCALIZAR RESPOSTA --------//

        const resposta = respostas.find(item => {

            return (

                Number(item.id_feedback) === Number(feedback.id) &&

                Number(item.id_colaborador) === Number(destinatario.id) &&

                Number(item.ativo) === 1

            );

        });


        //----------------- ORGANIZAR DATA -------------//

        const data = new Date(feedback.data_feedback);


        //----------------- RETORNAR DADOS --------------//

        return {

            id: feedback.id,

            tipo: feedback.tipo,

            tipoFormatado: formatarTipo(feedback.tipo),

            descricao: feedback.descricao,

            data,

            dataFormatada: formatarData(feedback.data_feedback),

            ativo: Number(feedback.ativo) === 1,

            remetente,

            destinatario,

            resposta: resposta ? {

                id: resposta.id,

                idColaborador: resposta.id_colaborador,

                descricao: resposta.descricao,

                data: new Date(resposta.data_resposta),

                dataFormatada: formatarData(resposta.data_resposta)

            } : null,

            status: resposta ? 'Respondido' : 'Registrado'

        };

    });


    //----------------- ORDENAR POR DATA ---------------//

    return informacoes.sort(

        (a, b) => b.data.getTime() - a.data.getTime()

    );

}


export default montarInformacoesFeedbacks;
