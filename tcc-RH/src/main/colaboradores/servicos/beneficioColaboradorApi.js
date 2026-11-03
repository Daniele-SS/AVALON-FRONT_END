//----------------- CONFIGURAÇÕES ---------------------------//

const API_BASE = 'http://localhost:8080/v1/senai/avalon';


//----------------- REQUISIÇÃO À API ------------------------//

async function requisicaoApi(rota, opcoes = {}) {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    const resposta = await fetch(`${API_BASE}${rota}`, {
        ...opcoes,

        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...opcoes.headers
        }
    });

    const texto = await resposta.text();

    let dados = {};

    try {
        dados = texto ? JSON.parse(texto) : {};
    } catch {
        dados = { mensagem: texto };
    }

    console.log('Rota:', `${API_BASE}${rota}`);
    console.log('Status HTTP:', resposta.status);
    console.log('Resposta da API:', dados);

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua autenticação expirou. Faça login novamente.');
    }

    if (
        !resposta.ok ||
        dados.status === false ||
        dados.success === false
    ) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            dados.erro ||
            'Não foi possível processar a requisição.'
        );
    }

    return dados;
}


//----------------- BUSCAR BENEFÍCIOS -----------------------//

export async function buscarBeneficios() {

    const resposta = await requisicaoApi('/beneficio');

    return resposta.response?.beneficios || [];
}


//----------------- BUSCAR VÍNCULOS --------------------------//

export async function buscarBeneficiosColaborador() {

    const resposta = await requisicaoApi('/beneficio_colaborador');

    return resposta.response?.beneficioColaborador || [];
}


//----------------- CADASTRAR VÍNCULO ------------------------//

export async function cadastrarBeneficioColaborador(dados) {

    return await requisicaoApi('/beneficio_colaborador', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}


//----------------- EDITAR VÍNCULO ---------------------------//

export async function editarBeneficioColaborador(id, dados) {

    return await requisicaoApi(`/beneficio_colaborador/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}


//----------------- EXCLUIR VÍNCULO --------------------------//

export async function excluirBeneficioColaborador(id) {

    return await requisicaoApi(`/beneficio_colaborador/${id}`, {
        method: 'DELETE'
    });
}

//----------------- BUSCAR BENEFÍCIOS POR CARGO --------------//

export async function buscarBeneficiosCargo() {

    const resposta = await requisicaoApi('/beneficio_cargo');

    return resposta.response?.beneficioCargo || [];

}


//----------------- BUSCAR BENEFÍCIOS POR SETOR --------------//

export async function buscarBeneficiosSetor() {

    const resposta = await requisicaoApi('/beneficio_setor');

    return resposta.response?.beneficioSetor || [];

}