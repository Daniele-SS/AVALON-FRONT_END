//----------------- API DO CADASTRO DE CARGO ----------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR CARGOS ---------------------------//

async function buscarDadosCadastro() {

    const resposta = await fetch(`${API}/cargo`);

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

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify(dadosCargo)

    });

    const resultado = await resposta.json();

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