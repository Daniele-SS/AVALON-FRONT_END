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


//----------------- EDITAR FÉRIAS ---------------------------//

export async function editarFeriasApi(
    idFerias,
    dadosFerias
) {

    //----------------- VALIDAR ID ---------------------------//

    if (
        idFerias === null ||
        idFerias === undefined ||
        idFerias === ''
    ) {

        throw new Error(
            'Não foi possível identificar as férias que serão editadas.'
        );

    }


    const id =
        Number(idFerias);


    if (
        !Number.isFinite(id)
    ) {

        throw new Error(
            'O identificador das férias é inválido.'
        );

    }


    let respostaFerias;


    //----------------- REQUISIÇÃO ---------------------------//

    try {

        respostaFerias =
            await fetch(
                `${API}/ferias/${id}`,
                {
                    method: 'PUT',

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

        console.error(
            'Erro ao conectar com a API de edição de férias:',
            erro
        );

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

    if (
        !respostaFerias.ok
    ) {

        throw new Error(

            resultadoFerias.message ||

            resultadoFerias.mensagem ||

            resultadoFerias.error ||

            'Não foi possível atualizar as férias.'

        );

    }


    //----------------- IDENTIFICAR FÉRIAS -------------------//

    const feriasAtualizadas =

        resultadoFerias.response?.ferias ||

        resultadoFerias.response?.feriasAtualizadas ||

        resultadoFerias.response ||

        resultadoFerias;


    //----------------- ID -----------------------------------//

    const idFeriasAtualizadas =

        feriasAtualizadas?.id ??

        resultadoFerias.id ??

        id;


    //----------------- RETORNO ------------------------------//

    return {

        sucesso: true,

        idFerias:
            idFeriasAtualizadas,

        feriasAtualizadas,

        mensagem:

            resultadoFerias.message ||

            resultadoFerias.mensagem ||

            'Férias atualizadas com sucesso.'

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default editarFeriasApi;