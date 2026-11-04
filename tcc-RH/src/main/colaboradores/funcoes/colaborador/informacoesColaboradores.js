//----------------- INFORMAÇÕES DOS COLABORADORES ----------//

function montarInformacoesColaboradores(colaboradores, usuarios = []) {

    //----------------- OBTER ID DO SETOR -------------------//

    function obterIdSetor(colaborador) {

        const setorColaborador = Array.isArray(colaborador.setor)
            ? colaborador.setor[0]
            : colaborador.setor;

        return (
            colaborador.id_setor ??
            setorColaborador?.id ??
            setorColaborador?.id_setor
        );
    }


    //----------------- OBTER NOME DO SETOR -----------------//

    function obterNomeSetor(colaborador) {

        const setorColaborador = Array.isArray(colaborador.setor)
            ? colaborador.setor[0]
            : colaborador.setor;

        return (
            colaborador.nome_setor ??
            setorColaborador?.nome ??
            'Não definido'
        );
    }


//----------------- OBTER NOME DO CARGO -----------------//

function obterNomeCargo(colaborador) {

    // O cargo pode vir como objeto ou como lista.
    let cargoColaborador = Array.isArray(colaborador.cargo)
        ? colaborador.cargo[0]
        : colaborador.cargo;

    // Verificar se existem classificações dentro do cargo.
    const classificacoes = Array.isArray(
        cargoColaborador?.classificacao
    )
        ? cargoColaborador.classificacao
        : [];

    // Obter os nomes das classificações.
    const nomesCargos = classificacoes
        .map((cargo) => cargo.nome)
        .filter(Boolean);

    // Retornar o nome encontrado.
    return (
        colaborador.nome_cargo ||
        cargoColaborador?.nome ||
        (nomesCargos.length > 0
            ? nomesCargos.join(', ')
            : 'Não definido')
    );
}


    //----------------- LOCALIZAR USUÁRIO -------------------//

    function localizarUsuario(colaborador) {

        const idColaborador =
            colaborador.id_colaborador ??
            colaborador.id ??
            colaborador.idColaborador;

        if (idColaborador == null) {
            return null;
        }

        return usuarios.find(usuario => {

            // Caso o usuário tenha o ID do colaborador diretamente.
            const idDireto =
                usuario.id_colaborador ??
                usuario.idColaborador;

            if (
                idDireto != null &&
                String(idDireto) === String(idColaborador)
            ) {
                return true;
            }

            // Caso o usuário tenha colaboradores relacionados.
            let colaboradoresUsuario =
                usuario.colaborador ||
                usuario.colaboradores ||
                [];

            if (!Array.isArray(colaboradoresUsuario)) {
                colaboradoresUsuario = [colaboradoresUsuario];
            }

            return colaboradoresUsuario.some(item => {

                const id =
                    item.id_colaborador ??
                    item.id ??
                    item.idColaborador;

                return (
                    id != null &&
                    String(id) === String(idColaborador)
                );
            });

        }) || null;
    }


    //----------------- IDENTIFICAR GESTOR ------------------//

    function obterGestorDireto(colaborador) {

        const idSetorColaborador =
            obterIdSetor(colaborador);

        if (idSetorColaborador == null) {
            return 'Não definido';
        }

        const usuarioGestor = usuarios.find(usuario => {

            const niveis =
                usuario.nivel_acesso?.nivel_acesso || [];

            const temNivelGestor = niveis.some(nivel =>
                nivel.nome === 'Gestor' &&
                Number(nivel.status) === 1
            );

            if (!temNivelGestor) {
                return false;
            }

            let colaboradoresUsuario =
                usuario.colaborador ||
                usuario.colaboradores ||
                [];

            if (!Array.isArray(colaboradoresUsuario)) {
                colaboradoresUsuario = [colaboradoresUsuario];
            }

            return colaboradoresUsuario.some(item => {

                if (
                    String(item.status).toLowerCase() !== 'ativo'
                ) {
                    return false;
                }

                const idSetorGestor =
                    obterIdSetor(item);

                return (
                    Number(idSetorGestor) ===
                    Number(idSetorColaborador)
                );
            });

        });

        if (!usuarioGestor) {
            return 'Não definido';
        }

        let colaboradoresGestor =
            usuarioGestor.colaborador ||
            usuarioGestor.colaboradores ||
            [];

        if (!Array.isArray(colaboradoresGestor)) {
            colaboradoresGestor = [colaboradoresGestor];
        }

        const colaboradorGestor =
            colaboradoresGestor.find(item => {

                if (
                    String(item.status).toLowerCase() !== 'ativo'
                ) {
                    return false;
                }

                return (
                    Number(obterIdSetor(item)) ===
                    Number(idSetorColaborador)
                );
            });

        return (
            colaboradorGestor?.nome ||
            'Não definido'
        );
    }


    //----------------- MONTAR INFORMAÇÕES ------------------//

    return colaboradores.map(colaborador => {

        const usuario =
            localizarUsuario(colaborador);

        return {

            // Mantém TODOS os dados vindos da API.
            ...colaborador,

            // Informações calculadas.
            nome_setor:
                obterNomeSetor(colaborador),

            nome_cargo:
                obterNomeCargo(colaborador),

            gestor_direto:
                obterGestorDireto(colaborador),

            // Usuário relacionado ao colaborador.
            usuario
        };
    });
}


//----------------- EXPORTAÇÃO ------------------------------//

export default montarInformacoesColaboradores;