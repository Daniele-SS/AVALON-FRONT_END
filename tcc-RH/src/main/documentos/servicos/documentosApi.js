
//----------------- CONFIGURAÇÃO DA API -----------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO --------------------------//

function obterConfiguracao() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

}


//----------------- VERIFICAR AUTENTICAÇÃO --------------------------//

function verificarAutenticacao(resposta) {

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error('Sua autenticação expirou. Faça login novamente.');

    }

}


//----------------- BUSCAR DOCUMENTOS -------------------------------//

async function buscarDocumentos() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    const resposta = await fetch(`${API}/documento`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    verificarAutenticacao(resposta);

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {

        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível carregar os documentos.'
        );

    }

    return dados.response?.documentos || [];

}


//----------------- BUSCAR ARQUIVO PARA VISUALIZAÇÃO ----------------//

export async function buscarArquivoDocumento(id) {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    const resposta = await fetch(
        `${API}/documento/download/${id}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    verificarAutenticacao(resposta);

    if (!resposta.ok) {

        let mensagem = 'Não foi possível abrir o documento.';

        try {

            const dados = await resposta.json();

            mensagem =
                dados.message ||
                dados.mensagem ||
                mensagem;

        } catch (error) {

            console.error('Erro ao interpretar resposta:', error);

        }

        throw new Error(mensagem);

    }

    // Retorna o arquivo físico para a visualização.
    return await resposta.blob();

}


//----------------- ALTERAR STATUS DO DOCUMENTO ---------------------//

export async function alterarStatusDocumento(documento, ativo) {

    //----------------- CONFIGURAÇÃO -----------------------------//

    const headers = obterConfiguracao();


    //----------------- IDENTIFICAR DOCUMENTO --------------------//

    const idDocumento =
        documento?.id_documento ||
        documento?.id;


    //----------------- IDENTIFICAR COLABORADOR ------------------//

    // O colaborador pode vir como objeto ou array.
    const colaborador = Array.isArray(documento?.colaborador)
        ? documento.colaborador[0]
        : documento?.colaborador;

    const idColaborador =
        documento?.id_colaborador ||
        colaborador?.id_colaborador ||
        colaborador?.id;


    //----------------- VALIDAR DADOS -----------------------------//

    if (!idDocumento) {

        throw new Error(
            'Identificador do documento não encontrado.'
        );

    }

    if (!idColaborador) {

        throw new Error(
            'Não foi possível identificar o colaborador do documento.'
        );

    }

    if (!documento?.nome) {

        throw new Error(
            'Nome do documento não encontrado.'
        );

    }

    if (!documento?.tipo_documento) {

        throw new Error(
            'Tipo do documento não encontrado.'
        );

    }

    if (ativo !== 0 && ativo !== 1) {

        throw new Error(
            'Status do documento inválido.'
        );

    }


    //----------------- MONTAR DADOS ------------------------------//

    const dados = {

        id_colaborador: idColaborador,

        nome: documento.nome,

        tipo_documento: documento.tipo_documento,

        caminho_arquivo: documento.caminho_arquivo,

        // 0 = Arquivado | 1 = Ativo
        ativo: ativo

    };


    //----------------- ENVIAR ATUALIZAÇÃO ------------------------//

    const resposta = await fetch(
        `${API}/documento/${idDocumento}`,
        {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(dados)
        }
    );

    verificarAutenticacao(resposta);


    //----------------- TRATAR RESPOSTA ---------------------------//

    const resultado = await resposta.json();

    if (!resposta.ok || resultado.status === false) {

        throw new Error(
            resultado.message ||
            resultado.mensagem ||
            (
                ativo === 0
                    ? 'Não foi possível arquivar o documento.'
                    : 'Não foi possível desarquivar o documento.'
            )
        );

    }


    //----------------- RETORNAR RESULTADO ------------------------//

    return resultado;

}


//----------------- ARQUIVAR DOCUMENTO -----------------------------//

export async function arquivarDocumento(documento) {

    return await alterarStatusDocumento(documento, 0);

}


//----------------- DESARQUIVAR DOCUMENTO --------------------------//

export async function desarquivarDocumento(documento) {

    return await alterarStatusDocumento(documento, 1);

}


//----------------- EXPORTAÇÃO --------------------------------------//

export default buscarDocumentos;
