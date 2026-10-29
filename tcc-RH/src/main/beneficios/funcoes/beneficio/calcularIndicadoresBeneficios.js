
 //----------------- CALCULAR INDICADORES DE BENEFÍCIOS -----//

function calcularIndicadoresBeneficios(beneficios) {

    // Quantidade total de benefícios cadastrados.
    const totalCadastrados = beneficios.length;

    // Quantidade de benefícios ativos.
    const totalAtivos = beneficios.filter(
        beneficio => Number(beneficio.status) === 1
    ).length;

    // Quantidade de benefícios inativos.
    const totalInativos = beneficios.filter(
        beneficio => Number(beneficio.status) === 0
    ).length;

    return {
        totalCadastrados,
        totalAtivos,
        totalInativos
    };

}

//----------------- EXPORTAÇÃO ------------------------------//

export default calcularIndicadoresBeneficios;
