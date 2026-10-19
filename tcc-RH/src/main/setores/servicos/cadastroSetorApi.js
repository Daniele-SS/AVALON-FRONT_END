
 //----------------- API DO CADASTRO DE SETOR ----------------//

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


//----------------- BUSCAR DADOS ----------------------------//

async function buscarDadosCadastro() {

    const respostaSetores = await fetch(`${API}/setor`, {
        method: 'GET',
        headers: obterConfiguracao()
    });

    if (respostaSetores.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua autenticação expirou. Faça login novamente.');
    }

    if (!respostaSetores.ok) {
        throw new Error('Erro ao carregar setores.');
    }

    const dadosSetores = await respostaSetores.json();

    return dadosSetores.response?.setor || [];

}


//----------------- CADASTRAR SETOR -------------------------//

async function cadastrarSetor(dadosSetor) {

    const resposta = await fetch(`${API}/setor`, {
        method: 'POST',

        headers: obterConfiguracao(),

        body: JSON.stringify(dadosSetor)
    });

    const resultado = await resposta.json();

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua autenticação expirou. Faça login novamente.');
    }

    if (!resposta.ok || Number(resultado.status_code) >= 400) {
        throw new Error(
            resultado.message ||
            resultado.mensagem ||
            'Não foi possível cadastrar o setor.'
        );
    }

    return resultado;

}


//----------------- EXPORTAÇÃO ------------------------------//

export {
    buscarDadosCadastro,
    cadastrarSetor
};
