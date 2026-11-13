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


//----------------- BUSCAR DADOS DO DASHBOARD ---------------//

async function buscarDadosDashboard() {

    const configuracao = obterConfiguracao();

    const [
        resColaboradores,
        resSetores,
        resAvaliacoes,
        resParticipacoes,
        resAvaliacoesSetores,
        resAvaliacoesCargos,
        resDocumentos,
        resFerias,
        resPlanosAcao
    ] = await Promise.allSettled([
        fetch(`${API}/colaborador`, { headers: configuracao }),
        fetch(`${API}/setor`, { headers: configuracao }),
        fetch(`${API}/avaliacao`, { headers: configuracao }),
        fetch(`${API}/avaliacao_participacao`, { headers: configuracao }),
        fetch(`${API}/avaliacao_setor`, { headers: configuracao }),
        fetch(`${API}/avaliacao_cargo`, { headers: configuracao }),
        fetch(`${API}/documento`, { headers: configuracao }),
        fetch(`${API}/ferias`, { headers: configuracao }),
        fetch(`${API}/plano_acao`, { headers: configuracao })
    ]);

    const respostas = [
        resColaboradores,
        resSetores,
        resAvaliacoes,
        resParticipacoes,
        resAvaliacoesSetores,
        resAvaliacoesCargos,
        resDocumentos,
        resFerias,
        resPlanosAcao
    ];

    const expirou = respostas.some(
        (r) => r.status === 'fulfilled' && r.value.status === 401
    );

    if (expirou) {
        localStorage.removeItem('access_token');
        throw new Error('Sua autenticação expirou. Faça login novamente.');
    }

    async function extrairJson(resultadoFetch) {
        if (resultadoFetch.status !== 'fulfilled' || !resultadoFetch.value.ok) {
            return {};
        }
        try {
            return await resultadoFetch.value.json();
        } catch {
            return {};
        }
    }

    const [
        dadosColaboradores,
        dadosSetores,
        dadosAvaliacoes,
        dadosParticipacoes,
        dadosAvaliacoesSetores,
        dadosAvaliacoesCargos,
        dadosDocumentos,
        dadosFerias,
        dadosPlanosAcao
    ] = await Promise.all([
        extrairJson(resColaboradores),
        extrairJson(resSetores),
        extrairJson(resAvaliacoes),
        extrairJson(resParticipacoes),
        extrairJson(resAvaliacoesSetores),
        extrairJson(resAvaliacoesCargos),
        extrairJson(resDocumentos),
        extrairJson(resFerias),
        extrairJson(resPlanosAcao)
    ]);

    return {
        colaboradores:
            dadosColaboradores.response?.colaborador ??
            dadosColaboradores.colaborador ??
            [],

        setores:
            dadosSetores.response?.setor ??
            dadosSetores.setor ??
            [],

        avaliacoes:
            dadosAvaliacoes.response?.avaliacoes ??
            dadosAvaliacoes.avaliacoes ??
            [],

        participacoes:
            dadosParticipacoes.response?.participacoes ??
            dadosParticipacoes.participacoes ??
            [],

        avaliacoesSetores:
            dadosAvaliacoesSetores.response?.avaliacao_setor ??
            dadosAvaliacoesSetores.avaliacao_setor ??
            [],

        avaliacoesCargos:
            dadosAvaliacoesCargos.response?.avaliacaoCargos ??
            dadosAvaliacoesCargos.avaliacaoCargos ??
            [],

        documentos:
            dadosDocumentos.response?.documentos ??
            dadosDocumentos.documentos ??
            [],

        ferias:
            dadosFerias.response?.ferias ??
            dadosFerias.ferias ??
            [],

        planosAcao:
            dadosPlanosAcao.response?.planos_acao ??
            dadosPlanosAcao.response?.plano_acao ??
            dadosPlanosAcao.planos_acao ??
            []
    };
}

export default buscarDadosDashboard;