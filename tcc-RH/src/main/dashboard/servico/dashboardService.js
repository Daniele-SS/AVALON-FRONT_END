
/********************************************************************************
 * Objetivo:
 * Buscar os dados utilizados no Dashboard.
 *
 * Para o Gestor:
 * - Reutilizar a função original da Minha Equipe.
 * - Obter o gestor, o setor e a equipe pela mesma regra da tela Minha Equipe.
 *
 * Mantém os endpoints existentes.
 ********************************************************************************/

import montarInformacoesEquipe from '../../minhaEquipe/funcoes/equipe/montarInformacoesEquipe';

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- USUÁRIO LOGADO -------------------------------//

function obterUsuarioLogado() {
    try {
        const salvo =
            localStorage.getItem('usuario') ||
            localStorage.getItem('usuarioLogin');

        if (!salvo) {
            return {};
        }

        const usuario = JSON.parse(salvo);

        return (
            usuario?.usuario ??
            usuario?.response?.usuario ??
            usuario?.response ??
            usuario
        );
    } catch (erro) {
        console.error(
            'Erro ao obter usuário logado:',
            erro
        );

        return {};
    }
}


//----------------- NÍVEL DE ACESSO -------------------------------//

function obterNivelAcesso(usuario) {
    const nivel =
        usuario?.nivel_acesso?.nome ??
        usuario?.nivel_acesso ??
        usuario?.nivel ??
        '';

    if (typeof nivel === 'string') {
        return nivel.trim().toLowerCase();
    }

    return String(nivel?.nome || '')
        .trim()
        .toLowerCase();
}


//----------------- CONFIGURAÇÃO ---------------------------------//

function obterConfiguracao() {
    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error(
            'Token não encontrado. Faça login novamente.'
        );
    }

    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}


//----------------- BUSCAR ENDPOINT ------------------------------//

async function buscarEndpoint(endpoint, configuracao) {
    const resposta = await fetch(`${API}${endpoint}`, {
        method: 'GET',
        headers: configuracao
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');

        throw new Error(
            'Sua sessão expirou. Faça login novamente.'
        );
    }

    if (!resposta.ok) {
        const mensagem =
            `Não foi possível carregar ${endpoint}. ` +
            `Status: ${resposta.status}`;

        console.error(mensagem);

        throw new Error(mensagem);
    }

    return await resposta.json();
}


//----------------- EXTRAIR LISTAS -------------------------------//

function obterLista(resposta, chaves) {
    const dados = resposta?.response ?? resposta;

    for (const chave of chaves) {
        const lista = dados?.[chave];

        if (Array.isArray(lista)) {
            return lista;
        }
    }

    return [];
}


//----------------- BUSCAR DADOS DO DASHBOARD ---------------------//

async function buscarDadosDashboard() {
    const configuracao = obterConfiguracao();

    const usuarioLogado = obterUsuarioLogado();

    const ehGestor =
        obterNivelAcesso(usuarioLogado) === 'gestor';

    const [
        dadosColaboradores,
        dadosUsuarios,
        dadosSetores,
        dadosAvaliacoes,
        dadosParticipacoes,
        dadosAvaliacoesSetores,
        dadosFerias,
        dadosPlanosAcao,
        dadosResultados
    ] = await Promise.all([
        buscarEndpoint('/colaborador', configuracao),
        buscarEndpoint('/usuario', configuracao),
        buscarEndpoint('/setor', configuracao),
        buscarEndpoint('/avaliacao', configuracao),
        buscarEndpoint('/avaliacao_participacao', configuracao),
        buscarEndpoint('/avaliacao_setor', configuracao),
        buscarEndpoint('/ferias', configuracao),
        buscarEndpoint('/plano_acao', configuracao),
        buscarEndpoint('/avaliacao_resultado', configuracao)
    ]);


    //----------------- LISTAS DA API -----------------------------//

    const colaboradores = obterLista(
        dadosColaboradores,
        ['colaborador', 'colaboradores']
    );

    const usuarios = obterLista(
        dadosUsuarios,
        ['usuario', 'usuarios']
    );


    //----------------- MONTAR EQUIPE DO GESTOR ------------------//

    let gestor = null;
    let equipeGestor = [];
    let idColaboradorGestor = null;
    let idSetorGestor = null;

    if (ehGestor) {
        /*
         * IMPORTANTE:
         * Esta é a mesma função utilizada pela tela Minha Equipe.
         * Não montar a equipe novamente com filtros diferentes.
         */
        const resultadoEquipe = montarInformacoesEquipe(
            colaboradores,
            usuarios
        );

        gestor = resultadoEquipe.gestor ?? null;

        equipeGestor = Array.isArray(resultadoEquipe.equipe)
            ? resultadoEquipe.equipe
            : [];

        idColaboradorGestor =
            gestor?.id_colaborador ??
            gestor?.id ??
            gestor?.idColaborador ??
            null;

        const setorGestor = Array.isArray(gestor?.setor)
            ? gestor.setor[0]
            : gestor?.setor;

        idSetorGestor =
            gestor?.id_setor ??
            setorGestor?.id_setor ??
            setorGestor?.id ??
            null;

        if (idColaboradorGestor != null) {
            idColaboradorGestor =
                String(idColaboradorGestor);
        }

        if (idSetorGestor != null) {
            idSetorGestor = String(idSetorGestor);
        }

        console.log(
            '========== DASHBOARD GESTOR =========='
        );

        console.log('Gestor identificado:', gestor);
        console.log(
            'ID do colaborador:',
            idColaboradorGestor
        );
        console.log('ID do setor:', idSetorGestor);
        console.log('Total da equipe:', equipeGestor.length);

        console.log(
            '======================================'
        );
    }


    //----------------- RETORNAR DADOS ----------------------------//

    return {
        usuarioLogado,
        ehGestor,
        gestor,
        idColaboradorGestor,
        idSetorGestor,
        equipeGestor,

        colaboradores,
        usuarios,

        setores: obterLista(
            dadosSetores,
            ['setor', 'setores']
        ),

        avaliacoes: obterLista(
            dadosAvaliacoes,
            ['avaliacoes', 'avaliacao']
        ),

        participacoes: obterLista(
            dadosParticipacoes,
            ['participacoes', 'avaliacao_participacao']
        ),

        avaliacoesSetores: obterLista(
            dadosAvaliacoesSetores,
            ['avaliacao_setor', 'avaliacoes_setores']
        ),

        ferias: obterLista(
            dadosFerias,
            ['ferias', 'solicitacoes']
        ),

        planosAcao: obterLista(
            dadosPlanosAcao,
            ['planos_acao', 'plano_acao', 'planos']
        ),

        resultados: obterLista(
            dadosResultados,
            ['resultados', 'avaliacao_resultado']
        )
    };
}


//----------------- EXPORTAÇÃO -----------------------------------//

export default buscarDadosDashboard;
