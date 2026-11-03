
//----------------- CONFIGURAÇÕES -----------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR SETORES -----------------------------//

async function buscarSetoresBeneficio() {

    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${API}/setor`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        }
    });

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível carregar os setores.'
        );
    }

    // Retorna somente setores ativos.
    return (dados.response?.setor || []).filter(
        (setor) => Number(setor.status) === 1
    );

}


//----------------- BUSCAR CARGOS ------------------------------//

async function buscarCargosBeneficio() {

    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${API}/cargo`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        }
    });

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível carregar os cargos.'
        );
    }

    // Retorna somente cargos ativos.
    return (dados.response?.cargos || []).filter(
        (cargo) => Number(cargo.status) === 1
    );

}


//----------------- EXPORTAÇÕES --------------------------------//

export {
    buscarSetoresBeneficio,
    buscarCargosBeneficio
};
