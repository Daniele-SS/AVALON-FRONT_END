
const API = 'http://localhost:8080/v1/senai/avalon';

// Busca as regras cadastradas no Motor de Regras.
async function buscarRegrasAvaliacao() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    const resposta = await fetch(`${API}/motor_regras`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua sessão expirou. Faça login novamente.');
    }

    if (!resposta.ok) {
        throw new Error('Não foi possível buscar as regras do Motor de Regras.');
    }

    const dados = await resposta.json();

    return dados.response?.motorRegras
        ?? dados.motorRegras
        ?? [];

}

export default buscarRegrasAvaliacao;
