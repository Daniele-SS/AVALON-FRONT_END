
/********************************************************************************
 * Objetivo: Encerrar manualmente uma avaliação psicossocial
 * Atualiza o status da avaliação para 1 através do PUT
 * Confirma a atualização consultando novamente o backend
 ********************************************************************************/

//----------------- CONFIGURAÇÕES -----------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- EXTRAIR A AVALIAÇÃO DA RESPOSTA -----------//

function extrairAvaliacao(dados) {

    return (
        dados?.response?.avaliacao ||
        dados?.DEFAULT_MESSAGE?.response?.avaliacao ||
        dados?.data?.response?.avaliacao ||
        dados?.avaliacao ||
        dados?.data?.avaliacao ||
        dados?.data ||
        dados
    );

}


//----------------- ENCERRAR AVALIAÇÃO ----------------------//

async function encerrarAvaliacao(avaliacao) {

    try {

        const token = localStorage.getItem('access_token');

        if (!token) {
            throw new Error('Token de autenticação não encontrado.');
        }

        if (!avaliacao?.id) {
            throw new Error('ID da avaliação não informado.');
        }


        //----------------- DADOS PARA ATUALIZAÇÃO -------------//

        const dadosAvaliacao = {
            titulo: avaliacao.titulo,
            descricao: avaliacao.descricao ?? null,
            data_inicio: avaliacao.data_inicio,
            data_fim: avaliacao.data_fim,
            anonimo: avaliacao.anonimo,
            status: 1,
            publico_selecionado: avaliacao.publico_selecionado
        };


        //----------------- REQUISIÇÃO PUT --------------------//

        const respostaPut = await fetch(
            `${API}/avaliacao/${avaliacao.id}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(dadosAvaliacao)
            }
        );


        //----------------- LER RESPOSTA DO PUT ----------------//

        const dadosPut = await respostaPut.json();

        console.log('Resposta do PUT de encerramento:', dadosPut);


        //----------------- VERIFICAR RESPOSTA HTTP ------------//

        if (!respostaPut.ok) {

            throw new Error(
                dadosPut.message ||
                dadosPut.mensagem ||
                dadosPut.error ||
                'O backend recusou o encerramento da avaliação.'
            );

        }


        //----------------- CONSULTAR STATUS NO BACKEND --------//

        const respostaGet = await fetch(
            `${API}/avaliacao/${avaliacao.id}`,
            {
                method: 'GET',

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );


        //----------------- LER RESPOSTA DO GET ----------------//

        const dadosGet = await respostaGet.json();

        console.log('Resposta do GET após o PUT:', dadosGet);


        //----------------- VERIFICAR CONSULTA ----------------//

        if (!respostaGet.ok) {

            throw new Error(
                'O PUT foi enviado, mas não foi possível confirmar o status da avaliação.'
            );

        }


        //----------------- EXTRAIR AVALIAÇÃO ------------------//

        const avaliacaoAtualizada = extrairAvaliacao(dadosGet);

        const statusAtualizado = Number(
            avaliacaoAtualizada?.status
        );


        //----------------- CONFIRMAR ENCERRAMENTO -------------//

        if (statusAtualizado !== 1) {

            console.error(
                'O backend ainda retorna status diferente de 1:',
                avaliacaoAtualizada
            );

            throw new Error(
                'O backend recebeu o encerramento, mas o status não foi atualizado no banco. Verifique o PUT da avaliação.'
            );

        }


        //----------------- RETORNAR CONFIRMAÇÃO ----------------//

        return avaliacaoAtualizada;

    } catch (erro) {

        console.error(
            'Erro ao encerrar avaliação:',
            erro
        );

        throw erro;

    }

}


//----------------- EXPORTAÇÃO -------------------------------//

export default encerrarAvaliacao;
