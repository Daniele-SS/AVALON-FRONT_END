//----------------- DATA ATUAL -----------------------------//

// Obtém a data de hoje no horário local.
export function obterDataHoje() {

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;

}


//----------------- PRÓXIMOS 30 DIAS -----------------------//

// Obtém a data limite de 30 dias a partir de hoje.
export function obterDataLimite() {

    const hoje = new Date();

    hoje.setHours(12, 0, 0, 0);
    hoje.setDate(hoje.getDate() + 30);

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;

}


//----------------- NORMALIZAR DATA ------------------------//

// Padroniza a data para o formato YYYY-MM-DD.
export function normalizarData(data) {

    if (!data) {
        return '';
    }

    return String(data).substring(0, 10);

}


//----------------- STATUS APROVADO ------------------------//

// Verifica se as férias foram aprovadas pelo gestor ou RH.
export function estaAprovada(feria) {

    const status = String(feria.status || '')
        .trim()
        .toLowerCase();

    return (
        status === 'aprovado pelo gestor' ||
        status === 'aprovado pelo rh'
    );

}


//----------------- CALCULAR FÉRIAS ------------------------//

// Calcula os indicadores exibidos nos minicards.
export function calcularIndicadoresFerias(ferias) {

    const hoje = obterDataHoje();
    const limite30Dias = obterDataLimite();
    const anoAtual = hoje.substring(0, 4);

    // Considera somente férias aprovadas.
    const feriasAprovadas = ferias.filter((feria) => {
        return estaAprovada(feria);
    });


    //----------------- FÉRIAS PROGRAMADAS ------------------//

    const programado = feriasAprovadas.filter((feria) => {

        const dataInicio = normalizarData(feria.data_inicio);

        return dataInicio !== '' && dataInicio > hoje;

    }).length;


    //----------------- EM FÉRIAS HOJE ----------------------//

    const emFeriasHoje = feriasAprovadas.filter((feria) => {

        const dataInicio = normalizarData(feria.data_inicio);
        const dataFim = normalizarData(feria.data_fim);

        return (
            dataInicio !== '' &&
            dataFim !== '' &&
            dataInicio <= hoje &&
            dataFim >= hoje
        );

    }).length;


    //----------------- PRÓXIMOS 30 DIAS --------------------//

    const proximos30Dias = feriasAprovadas.filter((feria) => {

        const dataInicio = normalizarData(feria.data_inicio);

        return (
            dataInicio !== '' &&
            dataInicio > hoje &&
            dataInicio <= limite30Dias
        );

    }).length;


    //----------------- FINALIZADAS NO ANO ------------------//

    const finalizadasNoAno = feriasAprovadas.filter((feria) => {

        const dataFim = normalizarData(feria.data_fim);

        return (
            dataFim !== '' &&
            dataFim < hoje &&
            dataFim.substring(0, 4) === anoAtual
        );

    }).length;


    //----------------- RETORNO DOS INDICADORES --------------//

    return {
        programado,
        emFeriasHoje,
        proximos30Dias,
        finalizadasNoAno
    };

}