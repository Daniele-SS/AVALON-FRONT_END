
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
        {
            nome: 'pesquisas',
            url: `${API_URL}/pesquisa`,
            campo: 'pesquisas',
            aceitarVazio: true
        },
        {
            nome: 'participacoes',
            url: `${API_URL}/participacao`,
            campo: 'participacoes',
            aceitarVazio: true
        },
        {
            nome: 'pesquisaSetores',
            url: `${API_URL}/pesquisa_setor`,
            campo: 'pesquisa_setores',
            aceitarVazio: true
        },
        {
            nome: 'pesquisaCargos',
            url: `${API_URL}/pesquisa_cargo`,
            campo: 'pesquisaCargos',
            aceitarVazio: true
        },
        {
            nome: 'colaboradores',
            url: `${API_URL}/colaborador`,
            campo: 'colaborador',
            aceitarVazio: false
        }
    ];

    const respostas = await Promise.all(

        rotas.map(async (rota) => {

            const resposta = await fetch(rota.url, configuracao);

            // Sessão expirada
            if (resposta.status === 401) {

                localStorage.removeItem('access_token');

                throw new Error(
                    'Sua sessão expirou. Faça login novamente.'
                );

            }

            // Não existem registros para listar
            if (resposta.status === 404 && rota.aceitarVazio) {

                return {
                    response: {
                        [rota.campo]: []
                    }
                };

            }

            // Outros erros continuam sendo informados
            if (!resposta.ok) {

                throw new Error(
                    `Erro ao buscar ${rota.nome}. Código: ${resposta.status}`
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
