
 //----------------- FORMATAR DATA ---------------------------//

 function formatarData(data) {

    if (!data) {
        return 'Não informada';
    }

    return new Date(data).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
    });

}


//----------------- OBTER COLABORADOR -----------------------//

function obterColaborador(ferias) {

    if (Array.isArray(ferias.colaborador)) {
        return ferias.colaborador[0] || {};
    }

    return ferias.colaborador || {};

}


//----------------- OBTER SETOR -----------------------------//

function obterSetor(colaborador) {

    if (Array.isArray(colaborador.setor)) {
        return colaborador.setor[0] || {};
    }

    return colaborador.setor || {};

}


//----------------- OBTER CARGO -----------------------------//

function obterCargo(colaborador) {

    const cargo = colaborador.cargo;

    if (!cargo) {
        return {};
    }

    if (Array.isArray(cargo)) {
        return cargo[0] || {};
    }

    if (Array.isArray(cargo.classificacao)) {
        return cargo.classificacao[0] || {};
    }

    return cargo.classificacao || cargo;

}


//----------------- MONTAR INFORMAÇÕES ----------------------//

function montarInformacoesFerias(ferias) {

    return ferias.map(feriasItem => {

        const colaborador = obterColaborador(feriasItem);

        const setor = obterSetor(colaborador);

        const cargo = obterCargo(colaborador);

        return {

            ...feriasItem,

            nome_colaborador:
                colaborador.nome || 'Não informado',

            matricula:
                colaborador.matricula || 'Não informada',

            nome_setor:
                setor.nome || 'Não informado',

            nome_cargo:
                cargo.nome || 'Não informado',

            data_inicio_formatada:
                formatarData(feriasItem.data_inicio),

            data_fim_formatada:
                formatarData(feriasItem.data_fim),

            quantidade_dias:
                feriasItem.quantidade_dias ?? 0,

            status:
                feriasItem.status || 'Pendente'

        };

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default montarInformacoesFerias;
