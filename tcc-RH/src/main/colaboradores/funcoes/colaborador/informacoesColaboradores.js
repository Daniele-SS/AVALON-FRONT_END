//----------------- INFORMAÇÕES DOS COLABORADORES ----------//

function montarInformacoesColaboradores(colaboradores, usuarios = []) {


    //----------------- OBTER ID DO SETOR -------------------//

    function obterIdSetor(colaborador) {

        const setorColaborador = Array.isArray(colaborador.setor)
            ? colaborador.setor[0]
            : colaborador.setor;

        return colaborador.id_setor ?? setorColaborador?.id;

    }


    //----------------- OBTER NOME DO SETOR -----------------//

    function obterNomeSetor(colaborador) {

        const setorColaborador = Array.isArray(colaborador.setor)
            ? colaborador.setor[0]
            : colaborador.setor;

        return setorColaborador?.nome || 'Não definido';

    }


    //----------------- OBTER NOME DO CARGO -----------------//

    function obterNomeCargo(colaborador) {

        const classificacoes = colaborador.cargo?.classificacao || [];

        const nomesCargos = classificacoes
            .map(cargo => cargo.nome)
            .filter(Boolean);

        return nomesCargos.join(', ') || 'Não definido';

    }


    //----------------- IDENTIFICAR GESTOR DO SETOR ---------//

    function obterGestorDireto(colaborador) {

        const idSetorColaborador = obterIdSetor(colaborador);

        if (idSetorColaborador == null) {
            return 'Não definido';
        }


        //----------------- PROCURAR USUÁRIO GESTOR ----------//

        const usuarioGestor = usuarios.find(usuario => {

            const niveis = usuario.nivel_acesso?.nivel_acesso || [];

            const temNivelGestor = niveis.some(nivel =>
                nivel.nome === 'Gestor' &&
                Number(nivel.status) === 1
            );

            if (!temNivelGestor) {
                return false;
            }


            //----------------- COLABORADORES DO USUÁRIO ------//

            const colaboradoresUsuario = usuario.colaborador || [];

            return colaboradoresUsuario.some(colaboradorUsuario => {

                //----------------- STATUS DO GESTOR ---------//

                if (colaboradorUsuario.status !== 'Ativo') {
                    return false;
                }

                //----------------- MESMO SETOR ---------------//

                const idSetorGestor = obterIdSetor(colaboradorUsuario);

                return Number(idSetorGestor) === Number(idSetorColaborador);

            });

        });


        //----------------- NOME DO GESTOR -------------------//

        if (!usuarioGestor) {
            return 'Não definido';
        }

        const colaboradoresGestor = usuarioGestor.colaborador || [];

        const colaboradorGestor = colaboradoresGestor.find(item => {

            if (item.status !== 'Ativo') {
                return false;
            }

            return Number(obterIdSetor(item)) === Number(idSetorColaborador);

        });

        return colaboradorGestor?.nome || 'Não definido';

    }


    //----------------- MONTAR INFORMAÇÕES ------------------//

    return colaboradores.map(colaborador => {

        return {

            ...colaborador,

            nome_setor: obterNomeSetor(colaborador),

            nome_cargo: obterNomeCargo(colaborador),

            gestor_direto: obterGestorDireto(colaborador)

        };

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default montarInformacoesColaboradores;