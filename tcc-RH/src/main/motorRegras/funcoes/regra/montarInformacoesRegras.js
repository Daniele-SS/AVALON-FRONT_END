
//----------------- INFORMAÇÕES DAS REGRAS -----------------//

function montarInformacoesRegras(regras = []) {

    const totalRegras = regras.length;


    //----------------- REGRAS ATIVAS -----------------------//

    const regrasAtivas = regras.filter(
        (regra) => Number(regra.ativo) === 1
    ).length;


    //----------------- REGRAS DE ATENÇÃO -------------------//

    const regrasAtencao = regras.filter(
        (regra) =>
            String(regra.classificacao).toUpperCase() === 'ATENÇÃO'
    ).length;


    //----------------- REGRAS DE PRIORIDADE ----------------//

    const regrasPrioridade = regras.filter(
        (regra) =>
            String(regra.classificacao).toUpperCase() === 'PRIORIDADE'
    ).length;


    //----------------- RETORNAR INFORMAÇÕES ----------------//

    return {
        totalRegras,
        regrasAtivas,
        regrasAtencao,
        regrasPrioridade
    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default montarInformacoesRegras;
