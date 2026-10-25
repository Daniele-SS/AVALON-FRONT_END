//----------------- CONFIGURAÇÃO DA API --------------------//

const API =
    'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO -----------------//

function obterConfiguracao() {

    const token =
        localStorage.getItem('access_token');


    if (!token) {

        throw new Error(
            'Token não encontrado. Faça login novamente.'
        );

    }


    return {

        'Authorization':
            `Bearer ${token}`,

        'Content-Type':
            'application/json'

    };

}


//----------------- CADASTRAR FÉRIAS ------------------------//

export async function cadastrarFerias(
    dadosFerias
) {

    let respostaFerias;


    //----------------- REQUISIÇÃO ---------------------------//

    try {

        respostaFerias =
            await fetch(
                `${API}/ferias`,
                {
                    method: 'POST',

                    headers:
                        obterConfiguracao(),

                    body:
                        JSON.stringify({

                            id_colaborador:
                                Number(
                                    dadosFerias.id_colaborador
                                ),

                            data_inicio:
                                dadosFerias.data_inicio,

                            data_fim:
                                dadosFerias.data_fim,

                            quantidade_dias:
                                Number(
                                    dadosFerias.quantidade_dias
                                ),

                            observacao:
                                dadosFerias.observacao || ''

                        })
                }
            );

    } catch (erro) {

        throw new Error(
            'Não foi possível conectar com a API de férias.'
        );

    }


    //----------------- RESPOSTA -----------------------------//

    let resultadoFerias = {};

    try {

        resultadoFerias =
            await respostaFerias.json();

    } catch {

        resultadoFerias = {};

    }


    //----------------- AUTENTICAÇÃO -------------------------//

    if (
        respostaFerias.status === 401
    ) {

        localStorage.removeItem(
            'access_token'
        );

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    //----------------- ERRO DA API --------------------------//

    if (!respostaFerias.ok) {

        throw new Error(

            resultadoFerias.message ||

            resultadoFerias.mensagem ||

            resultadoFerias.error ||

            'Não foi possível cadastrar as férias.'

        );

    }


    //----------------- IDENTIFICAR FÉRIAS -------------------//

    const feriasCriadas =

        resultadoFerias.response?.ferias ||

        resultadoFerias.response?.feriasCriadas ||

        resultadoFerias.response ||

        resultadoFerias;


    //----------------- ID -----------------------------------//

    const idFerias =
        feriasCriadas?.id ??
        resultadoFerias.id ??
        null;


    //----------------- RETORNO ------------------------------//

    return {

        sucesso: true,

        idFerias,

        feriasCriadas,

        mensagem:
            resultadoFerias.message ||

            resultadoFerias.mensagem ||

            'Férias cadastradas com sucesso.'

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default cadastrarFerias;