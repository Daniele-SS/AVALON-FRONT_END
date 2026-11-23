
/****************************************************************
 * Objetivo: Calcular a classificação visual e os indicadores
 *           dos planos de ação.
 * Importante: Não altera o status salvo no banco de dados.
 ****************************************************************/


//----------------- CONVERTER DATA -----------------------------//

function converterData(data) {

    if (!data) {
        return null;
    }

    // Quando receber um objeto Date, converte para UTC.
    if (data instanceof Date) {
        return Date.UTC(
            data.getFullYear(),
            data.getMonth(),
            data.getDate()
        );
    }

    // Quando receber uma data da API, utiliza apenas a parte da data.
    const dataSeparada = String(data).split('T')[0];
    const partes = dataSeparada.split('-');

    if (partes.length !== 3) {
        return null;
    }

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (!ano || !mes || !dia) {
        return null;
    }

    return Date.UTC(ano, mes - 1, dia);
}


//----------------- DIAS ENTRE DATAS --------------------------//

function calcularDiasEntreDatas(dataInicial, dataFinal) {

    const inicio = converterData(dataInicial);
    const fim = converterData(dataFinal);

    if (inicio === null || fim === null) {
        return null;
    }

    return Math.round((fim - inicio) / 86400000);
}


//----------------- CLASSIFICAR PLANO -------------------------//

function classificarPlano(plano, hoje = new Date()) {

    // Status 1 significa plano concluído ou encerrado.
    if (Number(plano.status) === 1) {
        return {
            statusVisual: 'Concluído',
            classeStatus: 'concluido'
        };
    }

    const hojeUTC = converterData(hoje);
    const dataInicio = converterData(plano.data_inicio);
    const dataFim = converterData(plano.data_fim);

    // Se a data de início ainda não chegou,
    // o plano permanece em andamento.
    if (
        dataInicio !== null &&
        dataInicio > hojeUTC
    ) {
        return {
            statusVisual: 'Em andamento',
            classeStatus: 'andamento',
            diasParaInicio: Math.round(
                (dataInicio - hojeUTC) / 86400000
            )
        };
    }

    // Se não houver prazo definido, permanece em andamento.
    if (dataFim === null) {
        return {
            statusVisual: 'Em andamento',
            classeStatus: 'andamento'
        };
    }

    const diasRestantes = Math.round(
        (dataFim - hojeUTC) / 86400000
    );

    // Plano ativo com prazo vencido.
    if (diasRestantes < 0) {
        return {
            statusVisual: 'Prioridade',
            classeStatus: 'prioridade',
            diasRestantes
        };
    }

    const totalTarefas = Number(plano.totalTarefas) || 0;
    const progresso = Number(plano.progresso) || 0;

    const duracao = calcularDiasEntreDatas(
        plano.data_inicio,
        plano.data_fim
    );

    const diasDecorridos = calcularDiasEntreDatas(
        plano.data_inicio,
        hoje
    );

    // Calcula quanto do prazo já passou.
    let progressoEsperado = 0;

    if (
        duracao !== null &&
        duracao > 0 &&
        diasDecorridos !== null
    ) {
        progressoEsperado = Math.min(
            100,
            Math.max(
                0,
                (diasDecorridos / duracao) * 100
            )
        );
    }

    // Atenção quando o progresso está muito abaixo
    // do esperado para o tempo decorrido.
    const progressoAtrasado =
        progressoEsperado >= 50 &&
        progresso < progressoEsperado - 25;

    // Atenção quando o prazo está próximo.
    const prazoProximo =
        diasRestantes <= 3 &&
        progresso < 80;

    // Plano sem tarefas próximo do prazo.
    const semTarefasPertoPrazo =
        totalTarefas === 0 &&
        diasRestantes <= 7;

    if (
        progressoAtrasado ||
        prazoProximo ||
        semTarefasPertoPrazo
    ) {
        return {
            statusVisual: 'Atenção',
            classeStatus: 'atencao',
            diasRestantes
        };
    }

    return {
        statusVisual: 'Em andamento',
        classeStatus: 'andamento',
        diasRestantes
    };
}


//----------------- CALCULAR INDICADORES ----------------------//

function calcularIndicadoresPlanosAcao(
    planos,
    hoje = new Date()
) {

    // Considera somente planos ativos.
    // Status 0 significa ativo.
    const planosAtivos = planos.filter(
        (plano) => Number(plano.status) === 0
    );

    // Indicadores de tarefas, não de planos.
    let tarefasAndamento = 0;
    let proximosPrazos = 0;
    let tarefasAtrasadas = 0;

    planosAtivos.forEach((plano) => {

        // Classifica o plano pelo prazo e progresso.
        const classificacao = classificarPlano(
            plano,
            hoje
        );

        // Obtém as tarefas relacionadas ao plano.
        const tarefasPlano = Array.isArray(plano.tarefasPlano)
            ? plano.tarefasPlano
            : [];

        // Considera somente tarefas ainda não concluídas.
        const tarefasPendentes = tarefasPlano.filter(
            (tarefa) => Number(tarefa.status) === 0
        );

        // Distribui as tarefas pendentes conforme
        // a classificação visual do plano.
        if (classificacao.classeStatus === 'andamento') {

            tarefasAndamento += tarefasPendentes.length;

        } else if (classificacao.classeStatus === 'atencao') {

            proximosPrazos += tarefasPendentes.length;

        } else if (classificacao.classeStatus === 'prioridade') {

            tarefasAtrasadas += tarefasPendentes.length;

        }

    });

    return {
        planosAtivos: planosAtivos.length,
        tarefasAndamento,
        proximosPrazos,
        tarefasAtrasadas
    };
}


//----------------- EXPORTAÇÃO ---------------------------------//

export {
    classificarPlano,
    calcularIndicadoresPlanosAcao
};
