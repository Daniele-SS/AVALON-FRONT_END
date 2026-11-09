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

    const autenticacaoExpirada = respostas.some(
        (resposta) => resposta.status === 401
    );

    if (autenticacaoExpirada) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    //----------------- VERIFICAR RESPOSTAS -----------------------//

    if (!respostaAvaliacoes.ok) {
        throw new Error('Não foi possível carregar as avaliações.');
    }

    if (!respostaParticipacoes.ok) {
        throw new Error('Não foi possível carregar as participações.');
    }

    if (!respostaSetores.ok) {
        throw new Error('Não foi possível carregar os setores das avaliações.');
    }

    if (!respostaCargos.ok) {
        throw new Error('Não foi possível carregar os cargos das avaliações.');
    }

    if (!respostaColaboradores.ok) {
        throw new Error('Não foi possível carregar os colaboradores.');
    }


    //----------------- CONVERTER RESPOSTAS -----------------------//

    const dadosAvaliacoes = await respostaAvaliacoes.json();

    const dadosParticipacoes = await respostaParticipacoes.json();

    const dadosSetores = await respostaSetores.json();

    const dadosCargos = await respostaCargos.json();

    const dadosColaboradores = await respostaColaboradores.json();


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
        dadosCargos.avaliacaoCargos ??
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