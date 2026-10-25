//----------------- DATA NO BRASIL --------------------------//

function obterDataBrasil(data) {
    if (!data) {
        return '';
    }

    const partes = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date(data));

    const ano = partes.find(parte => parte.type === 'year')?.value;
    const mes = partes.find(parte => parte.type === 'month')?.value;
    const dia = partes.find(parte => parte.type === 'day')?.value;

    if (!ano || !mes || !dia) {
        return '';
    }

    return `${ano}-${mes}-${dia}`;
}


//----------------- HOJE ------------------------------------//

function obterHojeBrasil() {
    const hoje = new Date();

    return obterDataBrasil(hoje);
}


//----------------- ADICIONAR DIAS ---------------------------//

function adicionarDias(dataString, quantidadeDias) {
    const [ano, mes, dia] = dataString
        .split('-')
        .map(Number);

    const data = new Date(
        ano,
        mes - 1,
        dia
    );

    data.setDate(
        data.getDate() + quantidadeDias
    );

    const novoAno = data.getFullYear();
    const novoMes = String(
        data.getMonth() + 1
    ).padStart(2, '0');

    const novoDia = String(
        data.getDate()
    ).padStart(2, '0');

    return `${novoAno}-${novoMes}-${novoDia}`;
}


//----------------- INDICADORES ------------------------------//

function calcularIndicadoresFerias(ferias = []) {

    const hoje = obterHojeBrasil();

    if (!hoje) {
        return {
            programado: 0,
            emFeriasHoje: 0,
            proximos30Dias: 0,
            finalizadasNoAno: 0
        };
    }

    const limite30Dias = adicionarDias(
        hoje,
        30
    );

    const anoAtual = hoje.substring(0, 4);

    let programado = 0;
    let emFeriasHoje = 0;
    let proximos30Dias = 0;
    let finalizadasNoAno = 0;

    ferias.forEach(feriasItem => {

        const inicio = obterDataBrasil(
            feriasItem.data_inicio
        );

        const fim = obterDataBrasil(
            feriasItem.data_fim
        );

        if (!inicio || !fim) {
            return;
        }


        //====================================================
        // FÉRIAS PROGRAMADAS
        //====================================================
        //
        // Começam depois de hoje.
        //

        if (inicio > hoje) {
            programado++;
        }


        //====================================================
        // EM FÉRIAS HOJE
        //====================================================
        //
        // Hoje está entre início e fim.
        //

        if (
            inicio <= hoje &&
            hoje <= fim
        ) {
            emFeriasHoje++;
        }


        //====================================================
        // PRÓXIMOS 30 DIAS
        //====================================================
        //
        // Começam entre amanhã e os próximos 30 dias.
        //

        if (
            inicio > hoje &&
            inicio <= limite30Dias
        ) {
            proximos30Dias++;
        }


        //====================================================
        // FINALIZADAS NO ANO
        //====================================================
        //
        // Já terminaram e terminaram no ano atual.
        //

        if (
            fim < hoje &&
            fim.substring(0, 4) === anoAtual
        ) {
            finalizadasNoAno++;
        }

    });


    return {
        programado,
        emFeriasHoje,
        proximos30Dias,
        finalizadasNoAno
    };
}


export {
    calcularIndicadoresFerias
};

export default calcularIndicadoresFerias;