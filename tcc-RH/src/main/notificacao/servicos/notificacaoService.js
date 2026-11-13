//----------------- CONFIGURAÇÕES ---------------------------//

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


//----------------- BUSCAR NOTIFICAÇÕES ---------------------//

export async function buscarNotificacoes() {

    const resposta = await fetch(`${API}/notificacao`, {
        method: 'GET',
        headers: obterConfiguracao()
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua autenticação expirou. Faça login novamente.');
    }

    if (!resposta.ok) {
        throw new Error('Não foi possível carregar as notificações.');
    }

    const dados = await resposta.json();

    return (
        dados.response?.notificacoes ??
        dados.response?.notificacao ??
        dados.notificacoes ??
        []
    );
}


//----------------- MARCAR NOTIFICAÇÃO COMO LIDA ------------//

export async function marcarNotificacaoComoLida(notificacao) {

    const id = notificacao.id_notificacao ?? notificacao.id;

    if (!id) return;

    const dadosAtualizados = {
        ...notificacao,
        lida: 1,
        status: 'Lida'
    };

    const resposta = await fetch(`${API}/notificacao/${id}`, {
        method: 'PUT',
        headers: obterConfiguracao(),
        body: JSON.stringify(dadosAtualizados)
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua autenticação expirou. Faça login novamente.');
    }

    if (!resposta.ok) {
        throw new Error('Não foi possível atualizar o status da notificação.');
    }

    return await resposta.json();
}