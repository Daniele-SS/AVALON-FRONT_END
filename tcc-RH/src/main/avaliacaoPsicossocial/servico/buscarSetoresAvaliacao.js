
const API = 'http://localhost:8080/v1/senai/avalon';

// Busca os setores ativos cadastrados
export default async function buscarSetoresAvaliacao() {
    try {
        const token = localStorage.getItem('access_token');

        const resposta = await fetch(`${API}/setor`, {
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
            throw new Error('Não foi possível buscar os setores.');
        }

        const dados = await resposta.json();

        const setores = dados.response?.setor ?? [];

        return setores.filter(setor => Number(setor.status) === 1);

    } catch (erro) {
        console.error('Erro ao buscar setores:', erro);
        throw erro;
    }
}
