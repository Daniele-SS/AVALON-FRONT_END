
/********************************************************************************
 * Objetivo: Verificar a situação da avaliação conforme as datas.
 *           Não altera o status salvo no banco de dados.
 ********************************************************************************/

//----------------- CONVERTER DATA PARA FORMATO LOCAL ----------------//

function converterData(data) {

    if (!data) {
        return null;
    }

    // Quando a API retorna uma data no formato YYYY-MM-DD,
    // usamos diretamente os valores para evitar problemas de fuso horário.
    const dataTexto = String(data);

    const correspondencia = dataTexto.match(
        /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (correspondencia) {

        return {
            ano: Number(correspondencia[1]),
            mes: Number(correspondencia[2]),
            dia: Number(correspondencia[3])
        };

    }

    // Quando a API retorna uma data ISO, convertemos para
    // o horário local do navegador.
    const dataConvertida = new Date(data);

    if (isNaN(dataConvertida.getTime())) {
        return null;
    }

    return {
        ano: dataConvertida.getFullYear(),
        mes: dataConvertida.getMonth() + 1,
        dia: dataConvertida.getDate()
    };

}


//----------------- COMPARAR DATAS ----------------------------------//

function compararDatas(data1, data2) {

    const valor1 =
        data1.ano * 10000 +
        data1.mes * 100 +
        data1.dia;

    const valor2 =
        data2.ano * 10000 +
        data2.mes * 100 +
        data2.dia;

    if (valor1 < valor2) {
        return -1;
    }

    if (valor1 > valor2) {
        return 1;
    }

    return 0;

}


//----------------- VERIFICAR SITUAÇÃO DA AVALIAÇÃO -----------------//

export default function verificarSituacaoAvaliacao(avaliacao) {

    const hoje = {
        ano: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        dia: new Date().getDate()
    };

    const dataInicio = converterData(avaliacao.data_inicio);

    const dataFim = converterData(avaliacao.data_fim);

    // Se alguma data estiver inválida, mantém a situação original.
    if (!dataInicio || !dataFim) {

        return {
            ...avaliacao,
            situacao_avaliacao: 'INDEFINIDA'
        };

    }

    //----------------- AVALIAÇÃO AINDA NÃO INICIADA -----------------//

    if (compararDatas(hoje, dataInicio) < 0) {

        return {
            ...avaliacao,
            situacao_avaliacao: 'NAO_INICIADA'
        };

    }

    //----------------- AVALIAÇÃO ENCERRADA --------------------------//

    // A avaliação continua válida durante todo o dia de encerramento.
    // Ela fica encerrada somente a partir do dia seguinte.

    if (compararDatas(hoje, dataFim) > 0) {

        return {
            ...avaliacao,
            situacao_avaliacao: 'ENCERRADA'
        };

    }

    //----------------- AVALIAÇÃO ATIVA ------------------------------//

    return {
        ...avaliacao,
        situacao_avaliacao: 'ATIVA'
    };

}
