
//----------------- CONFIGURAÇÃO DA API --------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CADASTRAR BENEFÍCIO ---------------------//

async function cadastrarBeneficio(dadosBeneficio) {

    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${API}/beneficio`, {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                Authorization: `Bearer ${token}`
            })
        },

        body: JSON.stringify(dadosBeneficio)
    });

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível cadastrar o benefício.'
        );
    }

    return dados.response;
}


//----------------- VINCULAR BENEFÍCIO AO CARGO -------------//

async function vincularBeneficioCargo(dadosVinculo) {

    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${API}/beneficio_cargo`, {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                Authorization: `Bearer ${token}`
            })
        },

        body: JSON.stringify(dadosVinculo)
    });

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível vincular o benefício ao cargo.'
        );
    }

    return dados.response;
}


//----------------- VINCULAR BENEFÍCIO AO SETOR -------------//

async function vincularBeneficioSetor(dadosVinculo) {

    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${API}/beneficio_setor`, {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                Authorization: `Bearer ${token}`
            })
        },

        body: JSON.stringify(dadosVinculo)
    });

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível vincular o benefício ao setor.'
        );
    }

    return dados.response;
}


//----------------- EXPORTAÇÃO ------------------------------//

export {
    cadastrarBeneficio,
    vincularBeneficioCargo,
    vincularBeneficioSetor
};
