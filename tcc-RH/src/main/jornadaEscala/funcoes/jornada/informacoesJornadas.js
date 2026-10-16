//----------------- INFORMAÇÕES DAS JORNADAS -----------------------------//

function montarInformacoesJornadas(jornadas = [], colaboradores = []) {

    const totalJornadas = jornadas.length;

    const jornadasAtivas = jornadas.filter(
        (jornada) => Number(jornada.status) === 1
    ).length;

    const jornadasUtilizadas = jornadas.filter((jornada) =>
        colaboradores.some((colaborador) => {

            const jornadasColaborador = colaborador.jornada_escala;

            if (Array.isArray(jornadasColaborador)) {
                return jornadasColaborador.some(
                    (item) => Number(item.id) === Number(jornada.id)
                );
            }

            return Number(jornadasColaborador?.id) === Number(jornada.id);
        })
    ).length;

    const percentualVinculos = totalJornadas > 0
        ? Math.round((jornadasUtilizadas / totalJornadas) * 100)
        : 0;

    return {
        totalJornadas,
        jornadasAtivas,
        jornadasUtilizadas,
        percentualVinculos
    };
}

//----------------- EXPORTAÇÃO -----------------------------------//

export default montarInformacoesJornadas;