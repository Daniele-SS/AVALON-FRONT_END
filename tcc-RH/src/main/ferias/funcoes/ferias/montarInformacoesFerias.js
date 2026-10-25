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


//----------------- OBTER DATA BRASIL -----------------------//

function obterDataBrasil(data) {

    if (!data) {
        return '';
    }

    const dataFormatada =
        new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(data));

    return dataFormatada;

}


//----------------- OBTER DATA DE HOJE ----------------------//

function obterHojeBrasil() {

    return obterDataBrasil(new Date());

}


//----------------- STATUS DAS FÉRIAS -----------------------//

function obterStatusFerias(ferias) {

    const inicio =
        obterDataBrasil(ferias.data_inicio);

    const fim =
        obterDataBrasil(ferias.data_fim);

    const hoje =
        obterHojeBrasil();


    // Sem datas
    if (!inicio || !fim) {

        return 'Pendente';

    }


    // Já terminou
    if (fim < hoje) {

        return 'Férias Finalizadas';

    }


    // Está de férias hoje
    if (
        inicio <= hoje &&
        hoje <= fim
    ) {

        return 'Férias';

    }


    // Ainda vai começar
    return 'Pendente';

}


//----------------- ORIGEM -------------------------------//
//
// A API atual ainda não retorna "origem".
//
// Quando o backend passar:
//      origem: "RH"
// ou:
//      origem: "GESTOR"
//
// esse valor será utilizado.
//
// Enquanto isso, NÃO vamos inventar RH automaticamente.
//

function obterOrigem(ferias) {

    if (ferias.origem) {

        return String(
            ferias.origem
        )
            .trim()
            .toUpperCase();

    }


    const status =
        String(
            ferias.status || ''
        )
            .trim()
            .toLowerCase();


    /*
     * Esses status claramente fazem parte
     * do fluxo do Gestor.
     */

    if (
        status === 'aprovado pelo gestor' ||
        status === 'aprovado pelo rh' ||
        status === 'recusado pelo gestor' ||
        status === 'recusado pelo rh'
    ) {

        return 'GESTOR';

    }


    /*
     * Para "Pendente", a API atual não permite
     * saber se foi criado pelo RH ou pelo Gestor.
     *
     * Por isso deixamos vazio.
     *
     * Quando o backend tiver "origem", isso será
     * preenchido corretamente.
     */

    return '';

}


//----------------- STATUS DE APROVAÇÃO --------------------//

function obterStatusAprovacao(ferias) {

    /*
     * Quando a API já retornar o campo,
     * usamos diretamente.
     */

    if (ferias.status_aprovacao) {

        return String(
            ferias.status_aprovacao
        )
            .trim()
            .toUpperCase();

    }


    const status =
        String(
            ferias.status || ''
        )
            .trim()
            .toLowerCase();


    if (status === 'pendente') {

        return 'PENDENTE';

    }


    if (status === 'aprovado pelo gestor') {

        return 'PENDENTE';

    }


    if (status === 'aprovado pelo rh') {

        return 'APROVADA';

    }


    if (status === 'recusado pelo gestor') {

        return 'RECUSADA';

    }


    if (status === 'recusado pelo rh') {

        return 'RECUSADA';

    }


    return '';

}


//----------------- MONTAR INFORMAÇÕES ----------------------//

function montarInformacoesFerias(ferias) {

    return ferias.map(feriasItem => {

        const colaborador =
            obterColaborador(feriasItem);

        const setor =
            obterSetor(colaborador);

        const cargo =
            obterCargo(colaborador);


        const status =
            obterStatusFerias(
                feriasItem
            );


        const origem =
            obterOrigem(
                feriasItem
            );


        const statusAprovacao =
            obterStatusAprovacao(
                feriasItem
            );


        return {

            ...feriasItem,


            // Dados do colaborador

            nome_colaborador:
                colaborador.nome ||
                'Não informado',

            matricula:
                colaborador.matricula ||
                'Não informada',


            // Setor

            nome_setor:
                setor.nome ||
                'Não informado',


            // Cargo

            nome_cargo:
                cargo.nome ||
                'Não informado',


            // Datas

            data_inicio_formatada:
                formatarData(
                    feriasItem.data_inicio
                ),

            data_fim_formatada:
                formatarData(
                    feriasItem.data_fim
                ),


            // Quantidade de dias

            quantidade_dias:
                feriasItem.quantidade_dias ?? 0,


            // Status original da API

            status_original:
                feriasItem.status ||
                'Pendente',


            // Status calculado para a tela

            status,


            // Fluxo de aprovação

            origem,

            status_aprovacao:
                statusAprovacao

        };

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default montarInformacoesFerias;