
/* ============================================================
   OBJETIVO: Aprovar ou rejeitar uma solicitação de férias.
   ARQUIVO: servicos/analisarFerias.js
============================================================ */

const API = 'http://localhost:8080/v1/senai/avalon';

/* Obtém as configurações de autenticação da API. */
function obterConfiguracao() {
    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

/* ============================================================
   FORMATAR DATAS PARA O MYSQL
============================================================ */

function formatarDataParaMySQL(data) {
    if (!data) {
        return '';
    }

    // Mantém datas que já estão no formato YYYY-MM-DD.
    if (
        typeof data === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {
        return data;
    }

    // Extrai a data de valores no formato ISO.
    if (typeof data === 'string') {
        const correspondencia = data.match(
            /^(\d{4}-\d{2}-\d{2})T/
        );

        if (correspondencia) {
            return correspondencia[1];
        }
    }

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
        throw new Error('Uma das datas das férias é inválida.');
    }

    return dataConvertida.toISOString().slice(0, 10);
}

/* ============================================================
   APROVAR OU REJEITAR SOLICITAÇÃO DE FÉRIAS
============================================================ */

export async function atualizarStatusFerias(ferias, novoStatus) {
    // Verifica se a solicitação possui um ID válido.
    if (!ferias || !ferias.id) {
        throw new Error(
            'Não foi possível identificar a solicitação de férias.'
        );
    }

    /*
     * Se o status for de rejeição, solicita a exclusão
     * do registro da tabela de férias pela API.
     *
     * IMPORTANTE:
     * Este código pressupõe que o backend possui
     * DELETE /ferias/:id. Confirme a rota antes de testar.
     */
    const statusRejeitado = [
        'Recusado pelo Gestor',
        'Recusado pelo RH'
    ];

    if (statusRejeitado.includes(novoStatus)) {
        let resposta;

        try {
            resposta = await fetch(
                `${API}/ferias/${ferias.id}`,
                {
                    method: 'DELETE',
                    headers: obterConfiguracao()
                }
            );
        } catch (erro) {
            console.error(
                'Erro de conexão ao excluir solicitação de férias:',
                erro
            );

            throw new Error(
                'Não foi possível conectar com a API de férias.'
            );
        }

        let resultado = {};

        try {
            resultado = await resposta.json();
        } catch {
            resultado = {};
        }

        if (resposta.status === 401) {
            localStorage.removeItem('access_token');

            throw new Error(
                'Sua autenticação expirou. Faça login novamente.'
            );
        }

        if (!resposta.ok) {
            console.error('Erro ao excluir solicitação:', {
                status: resposta.status,
                resultado
            });

            throw new Error(
                resultado.message ||
                resultado.mensagem ||
                'Não foi possível excluir a solicitação de férias.'
            );
        }

        return resultado;
    }

    // A partir daqui, o fluxo de aprovação permanece igual.

    const colaborador = Array.isArray(ferias.colaborador)
        ? ferias.colaborador[0] || {}
        : ferias.colaborador || {};

    const idColaborador =
        ferias.id_colaborador ??
        colaborador.id_colaborador ??
        colaborador.id_colaborador_fk ??
        colaborador.id;

    if (
        idColaborador === undefined ||
        idColaborador === null ||
        idColaborador === '' ||
        !Number.isFinite(Number(idColaborador)) ||
        Number(idColaborador) <= 0
    ) {
        console.error(
            'Não foi possível recuperar o ID do colaborador:',
            ferias
        );

        throw new Error(
            'Não foi possível identificar o ID do colaborador. Confira os dados retornados pela API.'
        );
    }

    const dados = {
        id_colaborador: Number(idColaborador),
        data_inicio: formatarDataParaMySQL(ferias.data_inicio),
        data_fim: formatarDataParaMySQL(ferias.data_fim),
        quantidade_dias: Number(ferias.quantidade_dias),
        status: novoStatus,
        observacao: ferias.observacao ?? null
    };

    if (
        !dados.data_inicio ||
        !dados.data_fim ||
        !Number.isFinite(dados.quantidade_dias) ||
        dados.quantidade_dias <= 0
    ) {
        console.error(
            'Dados enviados para atualizar férias:',
            dados
        );

        throw new Error(
            'A solicitação não possui todas as informações necessárias para atualização.'
        );
    }

    let resposta;

    try {
        resposta = await fetch(
            `${API}/ferias/${ferias.id}`,
            {
                method: 'PUT',
                headers: obterConfiguracao(),
                body: JSON.stringify(dados)
            }
        );
    } catch (erro) {
        console.error(
            'Erro de conexão com a API de férias:',
            erro
        );

        throw new Error(
            'Não foi possível conectar com a API de férias. Verifique se o backend está em execução.'
        );
    }

    let resultado = {};

    try {
        resultado = await resposta.json();
    } catch {
        resultado = {};
    }

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );
    }

    if (!resposta.ok) {
        console.error('Erro retornado pela API:', {
            status: resposta.status,
            resultado,
            dadosEnviados: dados
        });

        const mensagem =
            resultado.message ||
            resultado.mensagem ||
            resultado.field ||
            resultado.response?.message ||
            resultado.response?.field ||
            'Não foi possível atualizar a solicitação de férias.';

        throw new Error(
            `${mensagem} (HTTP ${resposta.status})`
        );
    }

    return resultado;
}

export default atualizarStatusFerias;
