//----------------- API DO CADASTRO DE SETOR ----------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR DADOS ----------------------------//

async function buscarDadosCadastro() {

    const respostaSetores = await fetch(`${API}/setor`);

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

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify(dadosSetor)
    });

    const resultado = await resposta.json();

    if (!resposta.ok || resultado.status_code >= 400) {
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