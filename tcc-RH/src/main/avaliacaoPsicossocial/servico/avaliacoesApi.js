
//----------------- API DE AVALIAÇÃO PSICOSSOCIAL -----------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO -----------------------//

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


//----------------- CONVERTER RESPOSTA ----------------------------//

async function converterResposta(resposta) {

    const texto = await resposta.text();

    if (!texto) {
        return {};
    }

    try {
        return JSON.parse(texto);
    } catch {
        throw new Error('O servidor retornou uma resposta inválida.');
    }

}


//----------------- BUSCAR DADOS ----------------------------------//

async function buscarDadosAvaliacaoPsicossocial() {

    const configuracao = obterConfiguracao();


    //----------------- BUSCAR AS CINCO ROTAS ---------------------//

    const [
        respostaAvaliacoes,
        respostaParticipacoes,
        respostaSetores,
        respostaCargos,
        respostaColaboradores
    ] = await Promise.all([

        fetch(`${API}/avaliacao`, {
            headers: configuracao
        }),

        fetch(`${API}/avaliacao_participacao`, {
            headers: configuracao
        }),

        fetch(`${API}/avaliacao_setor`, {
            headers: configuracao
        }),

        fetch(`${API}/avaliacao_cargo`, {
            headers: configuracao
        }),

        fetch(`${API}/colaborador`, {
            headers: configuracao
        })

    ]);


    //----------------- VERIFICAR AUTENTICAÇÃO --------------------//

    const respostas = [
        respostaAvaliacoes,
        respostaParticipacoes,
        respostaSetores,
        respostaCargos,
        respostaColaboradores
    ];

    if (respostas.some(resposta => resposta.status === 401)) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    //----------------- VERIFICAR RESPOSTAS OBRIGATÓRIAS ----------//

    if (!respostaAvaliacoes.ok) {
        throw new Error('Não foi possível carregar as avaliações.');
    }

    if (!respostaParticipacoes.ok) {
        throw new Error('Não foi possível carregar as participações.');
    }

    if (!respostaSetores.ok) {
        throw new Error('Não foi possível carregar os setores das avaliações.');
    }

    if (!respostaColaboradores.ok) {
        throw new Error('Não foi possível carregar os colaboradores.');
    }


    //----------------- VERIFICAR ROTA DE CARGOS ------------------//

    if (!respostaCargos.ok && respostaCargos.status !== 404) {

        throw new Error(
            'Não foi possível carregar os cargos das avaliações.'
        );

    }

    if (respostaCargos.status === 404) {

        console.warn(
            'A rota /avaliacao_cargo não foi encontrada no Back-end. A tela continuará carregando sem os vínculos de cargos.'
        );

    }


    //----------------- CONVERTER RESPOSTAS -----------------------//

    const dadosAvaliacoes = await converterResposta(respostaAvaliacoes);

    const dadosParticipacoes = await converterResposta(respostaParticipacoes);

    const dadosSetores = await converterResposta(respostaSetores);

    const dadosColaboradores = await converterResposta(respostaColaboradores);

    const dadosCargos = respostaCargos.ok
        ? await converterResposta(respostaCargos)
        : {};


    //----------------- ORGANIZAR AVALIAÇÕES ----------------------//

    const avaliacoes =
        dadosAvaliacoes.response?.avaliacoes ??
        dadosAvaliacoes.avaliacoes ??
        [];


    //----------------- ORGANIZAR PARTICIPAÇÕES -------------------//

    const participacoes =
        dadosParticipacoes.response?.participacoes ??
        dadosParticipacoes.participacoes ??
        [];


    //----------------- ORGANIZAR VÍNCULOS COM SETORES ------------//

    const avaliacoesSetores =
        dadosSetores.response?.avaliacao_setor ??
        dadosSetores.avaliacao_setor ??
        [];


    //----------------- ORGANIZAR VÍNCULOS COM CARGOS -------------//

    const avaliacoesCargos =
        dadosCargos.response?.avaliacaoCargos ??
        dadosCargos.response?.avaliacao_cargo ??
        dadosCargos.avaliacaoCargos ??
        dadosCargos.avaliacao_cargo ??
        [];


    //----------------- ORGANIZAR COLABORADORES -------------------//

    const colaboradores =
        dadosColaboradores.response?.colaborador ??
        dadosColaboradores.colaborador ??
        [];


    //----------------- CONFERIR DADOS NO CONSOLE -----------------//

    console.log('Avaliações carregadas:', avaliacoes);

    console.log('Participações carregadas:', participacoes);

    console.log('Setores das avaliações:', avaliacoesSetores);

    console.log('Cargos das avaliações:', avaliacoesCargos);

    console.log('Colaboradores carregados:', colaboradores);


    //----------------- RETORNAR DADOS ----------------------------//

    return {
        avaliacoes,
        participacoes,
        avaliacoesSetores,
        avaliacoesCargos,
        colaboradores
    };

}


//----------------- EXPORTAÇÃO ------------------------------------//

export default buscarDadosAvaliacaoPsicossocial;
