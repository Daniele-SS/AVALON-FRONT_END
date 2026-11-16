
const API = 'http://localhost:8080/v1/senai/avalon';

// Busca os cargos ativos cadastrados
export default async function buscarCargosAvaliacao() {
    try {
        const token = localStorage.getItem('access_token');

        const resposta = await fetch(`${API}/cargo`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (resposta.status === 401) {
            localStorage.removeItem('access_token');
            throw new Error('Sua sessão expirou. Faça login novamente.');
        }

        if (!resposta.ok) {
            throw new Error('Não foi possível buscar os cargos.');
        }

        const dados = await resposta.json();

        const cargos = dados.response?.cargos ?? [];

        return cargos.filter(cargo => Number(cargo.status) === 1);

    } catch (erro) {
        console.error('Erro ao buscar cargos:', erro);
        throw erro;
    }
}
