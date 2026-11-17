
/********************************************************************************
 * Objetivo: Identificar o gestor logado e montar as informações da sua equipe.
 ********************************************************************************/


//----------------- OBTER ID DO SETOR -----------------------//

function obterIdSetor(colaborador) {

    const setor = Array.isArray(colaborador.setor)
        ? colaborador.setor[0]
        : colaborador.setor;

    return (
        colaborador.id_setor ??
        setor?.id ??
        setor?.id_setor
    );
}


//----------------- OBTER NOME DO SETOR ---------------------//

function obterNomeSetor(colaborador) {

    const setor = Array.isArray(colaborador.setor)
        ? colaborador.setor[0]
        : colaborador.setor;

    return (
        colaborador.nome_setor ??
        setor?.nome ??
        'Não definido'
    );
}


//----------------- OBTER NOME DO CARGO ---------------------//

function obterNomeCargo(colaborador) {

    const cargo = Array.isArray(colaborador.cargo)
        ? colaborador.cargo[0]
        : colaborador.cargo;

    const classificacoes = Array.isArray(cargo?.classificacao)
        ? cargo.classificacao
        : [];

    const nomes = classificacoes
        .map(item => item.nome)
        .filter(Boolean);

    return (
        colaborador.nome_cargo ||
        cargo?.nome ||
        (nomes.length ? nomes.join(', ') : 'Não definido')
    );
}


//----------------- OBTER USUÁRIO LOGADO --------------------//

function obterUsuarioLogado() {

    const usuarioSalvo =
        localStorage.getItem('usuario') ||
        localStorage.getItem('usuarioLogin');

    if (!usuarioSalvo) {
        return null;
    }

    try {

        const usuario = JSON.parse(usuarioSalvo);

        return usuario?.usuario || usuario?.response?.usuario || usuario;

    } catch (erro) {

        console.error('Erro ao recuperar usuário logado:', erro);

        return null;

    }
}


//----------------- VERIFICAR NÍVEL DE ACESSO ----------------//

function verificarNivelGestor(usuario) {

    const nivel = usuario?.nivel_acesso;

    if (
        nivel?.nome?.toLowerCase() === 'gestor'
    ) {
        return true;
    }

    const niveis = Array.isArray(nivel?.nivel_acesso)
        ? nivel.nivel_acesso
        : Array.isArray(nivel)
            ? nivel
            : [];

    return niveis.some(item =>
        item.nome?.toLowerCase() === 'gestor' &&
        Number(item.status) === 1
    );
}


//----------------- LOCALIZAR GESTOR ------------------------//

function localizarGestor(usuarioLogado, usuarios, colaboradores) {

    const idUsuario =
        usuarioLogado?.id_usuario ??
        usuarioLogado?.id;

    const idColaborador =
        usuarioLogado?.id_colaborador ??
        usuarioLogado?.colaborador?.id_colaborador;

    // Procurar o usuário correspondente na API.
    const usuarioAPI = usuarios.find(usuario => {

        const id = usuario.id_usuario ?? usuario.id;

        return (
            idUsuario != null &&
            String(id) === String(idUsuario)
        );
    });

    // Obter o ID do colaborador relacionado ao usuário.
    const colaboradorRelacionado =
        idColaborador ??
        usuarioAPI?.id_colaborador ??
        usuarioAPI?.colaborador?.id_colaborador ??
        (Array.isArray(usuarioAPI?.colaborador)
            ? usuarioAPI.colaborador[0]?.id_colaborador
            : null);

    if (colaboradorRelacionado == null) {
        return null;
    }

    return colaboradores.find(colaborador => {

        const id =
            colaborador.id_colaborador ??
            colaborador.id ??
            colaborador.idColaborador;

        return String(id) === String(colaboradorRelacionado);

    }) || null;
}


//----------------- MONTAR EQUIPE ---------------------------//

function montarInformacoesEquipe(colaboradores, usuarios) {

    const usuarioLogado = obterUsuarioLogado();

    if (!usuarioLogado) {
        return {
            ehGestor: false,
            gestor: null,
            equipe: []
        };
    }

    if (!verificarNivelGestor(usuarioLogado)) {
        return {
            ehGestor: false,
            gestor: null,
            equipe: []
        };
    }

    const gestor = localizarGestor(
        usuarioLogado,
        usuarios,
        colaboradores
    );

    if (!gestor) {
        return {
            ehGestor: true,
            gestor: null,
            equipe: []
        };
    }

    const idSetorGestor = obterIdSetor(gestor);

    if (idSetorGestor == null) {
        return {
            ehGestor: true,
            gestor: null,
            equipe: []
        };
    }

    //----------------- IDENTIFICAR EQUIPE ------------------//

    const equipe = colaboradores
        .filter(colaborador => {

            const id =
                colaborador.id_colaborador ??
                colaborador.id ??
                colaborador.idColaborador;

            const idSetor = obterIdSetor(colaborador);

            // Não incluir o próprio gestor.
            if (
                String(id) === String(
                    gestor.id_colaborador ?? gestor.id
                )
            ) {
                return false;
            }

            return (
                Number(idSetor) === Number(idSetorGestor)
            );

        })
        .map(colaborador => ({

            ...colaborador,

            nome_setor:
                obterNomeSetor(colaborador),

            nome_cargo:
                obterNomeCargo(colaborador),

            gestor_direto:
                gestor.nome || 'Não definido'

        }));


    //----------------- RETORNAR RESULTADO ------------------//

    return {

        ehGestor: true,

        gestor: {

            ...gestor,

            nome_setor: obterNomeSetor(gestor),

            nome_cargo: obterNomeCargo(gestor)

        },

        equipe

    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default montarInformacoesEquipe;
