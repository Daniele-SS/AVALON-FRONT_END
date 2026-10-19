
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


    // Guarda a resposta como texto para não perder a mensagem original.

    const textoResposta = await resposta.text();

    let dados = {};

    try {

        dados = textoResposta ? JSON.parse(textoResposta) : {};

    } catch (erro) {

        dados = {
            mensagem: textoResposta
        };

    }


    // Mostra a resposta original da API no terminal do navegador.

    console.log('Rota:', `${API_BASE}${rota}`);
    console.log('Status HTTP:', resposta.status);
    console.log('Resposta da API:', dados);


    // Verifica se a autenticação expirou.

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    // Verifica se a requisição apresentou algum erro.

    if (
        !resposta.ok ||
        dados.status === false ||
        dados.success === false ||
        Number(dados.status_code) >= 400
    ) {

        const mensagem =
            dados.mensagem ||
            dados.message ||
            dados.erro ||
            dados.error ||
            'Não foi possível processar a requisição.';

        throw new Error(mensagem);

    }

    return dados;

}


//----------------- LOCALIZAR LISTAS ------------------------//

function localizarLista(dados, profundidade = 0) {

    if (Array.isArray(dados)) {
        return dados;
    }

    if (
        dados === null ||
        typeof dados !== 'object' ||
        profundidade > 4
    ) {
        return [];
    }

    const nomesPossiveis = [
        'dados',
        'response',
        'resultado',
        'data',
        'registros',
        'lista',
        'setores',
        'cargos',
        'niveis',
        'niveis_acesso',
        'jornadas',
        'jornada_escala',
        'dias_semana',
        'dia_semana',
        'colaboradores'
    ];

    for (const nome of nomesPossiveis) {

        if (dados[nome] !== undefined) {

            const lista = localizarLista(
                dados[nome],
                profundidade + 1
            );

            if (Array.isArray(lista)) {
                return lista;
            }

        }

    }

    for (const valor of Object.values(dados)) {

        if (Array.isArray(valor)) {
            return valor;
        }

        if (valor && typeof valor === 'object') {

            const lista = localizarLista(
                valor,
                profundidade + 1
            );

            if (lista.length > 0) {
                return lista;
            }

        }

    }

    return [];
}


//----------------- BUSCAR SETORES --------------------------//

export async function buscarSetores() {

    const resposta = await requisicaoApi('/setor');

    return localizarLista(resposta).map((setor) => ({

        ...setor,

        id: setor.id_setor ?? setor.id,

        nome: setor.nome ?? setor.nome_setor ?? ''

    }));

}


//----------------- BUSCAR CARGOS ---------------------------//

export async function buscarCargos() {

    const resposta = await requisicaoApi('/cargo');

    return localizarLista(resposta).map((cargo) => ({

        ...cargo,

        id: cargo.id_cargo ?? cargo.id,

        nome: cargo.nome ?? cargo.nome_cargo ?? ''

    }));

}


//----------------- BUSCAR NÍVEIS DE ACESSO ------------------//

export async function buscarNiveisAcesso() {

    const resposta = await requisicaoApi('/nivel_acesso');

    return localizarLista(resposta).map((nivel) => ({

        ...nivel,

        id: nivel.id_nivel_acesso ?? nivel.id,

        nome: nivel.nome ?? nivel.nome_nivel_acesso ?? ''

    }));

}


//----------------- BUSCAR JORNADAS E DIAS ------------------//

export async function buscarJornadas() {

    const respostaJornadas = await requisicaoApi(
        '/jornada_escala'
    );

    const jornadas = localizarLista(respostaJornadas);

    let diasSemana = [];

    try {

        const respostaDias = await requisicaoApi('/dia_semana');

        diasSemana = localizarLista(respostaDias);

    } catch (erro) {

        console.error(
            'Não foi possível carregar os dias das jornadas:',
            erro
        );

    }

    return jornadas.map((jornada) => {

        const idJornada =
            jornada.id_jornada_escala ?? jornada.id;

        const diasDaJornada = diasSemana.filter((dia) => {

            const idJornadaDia =
                dia.id_jornada_escala ??
                dia.idJornadaEscala;

            return String(idJornadaDia) === String(idJornada);

        });

        return {

            ...jornada,

            id: idJornada,

            nome:
                jornada.nome ??
                jornada.nome_jornada ??
                jornada.descricao ??
                'Jornada',

            dias_semana: diasDaJornada

        };

    });

}


//----------------- BUSCAR COLABORADORES --------------------//

export async function buscarColaboradores() {

    const resposta = await requisicaoApi('/colaborador');

    return localizarLista(resposta);

}


//----------------- CADASTRAR COLABORADOR -------------------//

export async function cadastrarColaborador(dadosColaborador) {

    return await requisicaoApi('/colaborador', {

        method: 'POST',

        body: JSON.stringify(dadosColaborador)

    });

}


//----------------- CADASTRAR USUÁRIO -----------------------//

export async function cadastrarUsuario(dadosUsuario) {

    return await requisicaoApi('/usuario', {

        method: 'POST',

        body: JSON.stringify(dadosUsuario)

    });

}


//----------------- LOCALIZAR ID DO COLABORADOR -------------//

export function extrairIdColaborador(dados, profundidade = 0) {

    if (
        dados === null ||
        typeof dados !== 'object' ||
        profundidade > 5
    ) {
        return null;
    }

    const possiveisIds = [
        'id_colaborador',
        'insertId',
        'insert_id',
        'id'
    ];

    for (const nome of possiveisIds) {

        if (
            dados[nome] !== undefined &&
            dados[nome] !== null &&
            dados[nome] !== ''
        ) {
            return dados[nome];
        }

    }

    for (const valor of Object.values(dados)) {

        if (valor && typeof valor === 'object') {

            const id = extrairIdColaborador(
                valor,
                profundidade + 1
            );

            if (id !== null) {
                return id;
            }

        }

    }

    return null;

}
