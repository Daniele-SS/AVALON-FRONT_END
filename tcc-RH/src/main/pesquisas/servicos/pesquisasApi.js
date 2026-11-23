
 //----------------- CONFIGURAÇÃO DA API ---------------------//

const API_URL = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR DADOS DAS PESQUISAS -------------//

export async function buscarDadosPesquisas() {

    const token = localStorage.getItem('access_token');

    const configuracao = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };

    const rotas = [
        `${API_URL}/pesquisa`,
        `${API_URL}/participacao`,
        `${API_URL}/pesquisa_setor`,
        `${API_URL}/pesquisa_cargo`,
        `${API_URL}/colaborador`
    ];

    const respostas = await Promise.all(

        rotas.map(async (rota) => {

            const resposta = await fetch(rota, configuracao);

            if (resposta.status === 401) {

                localStorage.removeItem('access_token');

                throw new Error(
                    'Sua sessão expirou. Faça login novamente.'
                );

            }

            if (!resposta.ok) {

                throw new Error(
                    `Erro ao buscar dados. Código: ${resposta.status}`
                );

            }

            return resposta.json();

        })

    );

    return {

        pesquisas: respostas[0]?.response?.pesquisas ?? [],

        participacoes: respostas[1]?.response?.participacoes ?? [],

        pesquisaSetores: respostas[2]?.response?.pesquisa_setores ?? [],

        pesquisaCargos: respostas[3]?.response?.pesquisaCargos ?? [],

        colaboradores: respostas[4]?.response?.colaborador ?? []

    };

}
