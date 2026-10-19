
//----------------- API DO CADASTRO DE CARGO ----------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO -----------------//

function obterConfiguracao() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

}


//----------------- BUSCAR CARGOS ---------------------------//

async function buscarDadosCadastro() {

    const resposta = await fetch(`${API}/cargo`, {
        method: 'GET',
        headers: obterConfiguracao()
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );
    }

    if (!resposta.ok) {
        throw new Error('Erro ao carregar cargos.');
    }

    const resultado = await resposta.json();

    return resultado.response?.classificacao || [];

}


//----------------- CADASTRAR CARGO -------------------------//

async function cadastrarCargo(dadosCargo) {

    const resposta = await fetch(`${API}/cargo`, {

        method: 'POST',

        headers: obterConfiguracao(),

        body: JSON.stringify(dadosCargo)

    });

    const resultado = await resposta.json();

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );
    }

    if (!resposta.ok || Number(resultado.status_code) >= 400) {

        throw new Error(
            resultado.message ||
            resultado.mensagem ||
            'Não foi possível cadastrar o cargo.'
        );

    }

    return resultado;

}


//----------------- EXPORTAÇÃO ------------------------------//

export {
    buscarDadosCadastro,
    cadastrarCargo
};
