//----------------- CALCULAR DIAS DE FÉRIAS ----------------//

function calcularDiasFerias(dataInicio, dataFim) {

    if (!dataInicio || !dataFim) {
        return 0;
    }


    const inicio = new Date(`${dataInicio}T00:00:00`);
    const fim = new Date(`${dataFim}T00:00:00`);


    if (
        Number.isNaN(inicio.getTime()) ||
        Number.isNaN(fim.getTime())
    ) {
        return 0;
    }


    if (fim < inicio) {
        return 0;
    }


    const diferenca =
        fim.getTime() -
        inicio.getTime();


    const dias =
        Math.floor(
            diferenca /
            (1000 * 60 * 60 * 24)
        ) + 1;


    return dias;

}


//----------------- EXPORTAÇÃO ------------------------------//

export default calcularDiasFerias;