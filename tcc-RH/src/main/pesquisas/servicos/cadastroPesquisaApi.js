
const API_URL = 'http://localhost:8080/v1/senai/avalon';

//-------------------- REQUISIÇÃO --------------------//

async function requisicao(endpoint, metodo = 'GET', dados = null) {
    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${API_URL}${endpoint}`, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...(dados ? { body: JSON.stringify(dados) } : {})
    });

    let resultado = {};

    try {
        resultado = await resposta.json();
    } catch {
        resultado = {};
    }

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua sessão expirou. Faça login novamente.');
    }

    if (!resposta.ok || resultado.status === false) {
        throw new Error(
            resultado.message ||
            resultado.mensagem ||
            `Erro na requisição: ${resposta.status}`
        );
    }

    return resultado;
}

//-------------------- LISTAR SETORES --------------------//

export async function buscarSetoresPesquisa() {
    const resultado = await requisicao('/setor');

    return resultado.response?.setores || [];
}

//-------------------- LISTAR CARGOS --------------------//

export async function buscarCargosPesquisa() {
    const resultado = await requisicao('/cargo');

    return resultado.response?.cargos || [];
}

//-------------------- LISTAR COLABORADORES --------------------//

export async function buscarColaboradoresPesquisa() {
    const resultado = await requisicao('/colaborador');

    return resultado.response?.colaborador || [];
}

//-------------------- EXTRAIR ID DA PESQUISA --------------------//

function extrairIdPesquisa(resultado) {
    const resposta = resultado?.response;

    return (
        resposta?.pesquisa?.id ||
        resposta?.id ||
        resposta?.pesquisa?.id_pesquisa ||
        resultado?.pesquisa?.id ||
        resultado?.id
    );
}

//-------------------- CADASTRAR PESQUISA COMPLETA --------------------//

export async function cadastrarPesquisaCompleta(dadosPesquisa, perguntas) {

    const resultadoPesquisa = await requisicao(
        '/pesquisa',
        'POST',
        dadosPesquisa
    );

    const idPesquisa = extrairIdPesquisa(resultadoPesquisa);

    if (!idPesquisa) {
        throw new Error(
            'A pesquisa foi enviada, mas não consegui identificar o ID retornado pela API.'
        );
    }

    // Cadastra as perguntas na ordem definida.
    for (let indice = 0; indice < perguntas.length; indice++) {
        const pergunta = perguntas[indice];

        await requisicao('/pergunta', 'POST', {
            id_pesquisa: Number(idPesquisa),
            enunciado: pergunta.enunciado.trim(),
            tipo: pergunta.tipo,
            ordem: indice + 1,
            obrigatorio: Number(pergunta.obrigatorio)
        });
    }

    // Vincula os setores selecionados.
    if (dadosPesquisa.publico_selecionado === 'SETOR') {
        for (const idSetor of dadosPesquisa.setores) {
            await requisicao('/pesquisa_setor', 'POST', {
                id_pesquisa: Number(idPesquisa),
                id_setor: Number(idSetor)
            });
        }
    }

    // Vincula os cargos selecionados.
    if (dadosPesquisa.publico_selecionado === 'CARGO') {
        for (const idCargo of dadosPesquisa.cargos) {
            await requisicao('/pesquisa_cargo', 'POST', {
                id_pesquisa: Number(idPesquisa),
                id_cargo: Number(idCargo)
            });
        }
    }

    return idPesquisa;
}
