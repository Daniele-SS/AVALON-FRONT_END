//----------------- INFORMAÇÕES DOS SETORES -----------------//

function montarInformacoesSetores(setores, colaboradores, usuarios) {

    return setores.map(setor => {

        //----------------- COLABORADORES -------------------//

        const colaboradoresSetor = colaboradores.filter(colaborador => {

            const setorColaborador = Array.isArray(colaborador.setor)
                ? colaborador.setor[0]
                : colaborador.setor;

            const idSetor = colaborador.id_setor ?? setorColaborador?.id;

            return Number(idSetor) === Number(setor.id);

        });


        //----------------- CARGOS --------------------------//

        const cargos = [];

        colaboradoresSetor.forEach(colaborador => {

            const classificacoes = colaborador.cargo?.classificacao || [];

            classificacoes.forEach(cargo => {

                if (!cargos.includes(cargo.id)) {
                    cargos.push(cargo.id);
                }

            });

            if (
                colaborador.id_cargo &&
                !cargos.includes(colaborador.id_cargo)
            ) {
                cargos.push(colaborador.id_cargo);
            }

        });


        //----------------- GESTORES ------------------------//

        const gestoresSetor = usuarios.filter(usuario => {

            const niveis = usuario.nivel_acesso?.nivel_acesso || [];

            const temNivelGestor = niveis.some(nivel =>
                nivel.nome === 'Gestor' &&
                Number(nivel.status) === 1
            );

            if (!temNivelGestor) {
                return false;
            }

            const colaboradoresUsuario = usuario.colaborador || [];

            return colaboradoresUsuario.some(colaboradorUsuario => {

                const colaboradorSetor = colaboradores.find(colaborador =>
                    Number(colaborador.id) === Number(colaboradorUsuario.id)
                );

                if (
                    !colaboradorSetor ||
                    colaboradorSetor.status !== 'Ativo'
                ) {
                    return false;
                }

                const setorColaborador = Array.isArray(colaboradorSetor.setor)
                    ? colaboradorSetor.setor[0]
                    : colaboradorSetor.setor;

                const idSetor =
                    colaboradorSetor.id_setor ?? setorColaborador?.id;

                return Number(idSetor) === Number(setor.id);

            });

        });


        //----------------- NOME DO GESTOR ------------------//

        const gestorResponsavel = gestoresSetor.map(usuario => {

            const colaboradorUsuario = (usuario.colaborador || []).find(item =>
                colaboradoresSetor.some(colaborador =>
                    Number(colaborador.id) === Number(item.id)
                )
            );

            return colaboradorUsuario?.nome;

        }).filter(Boolean).join(', ');


        //----------------- RETORNO -------------------------//

        return {
            ...setor,
            quantidade_colaboradores: colaboradoresSetor.length,
            gestor_responsavel: gestorResponsavel || 'Não definido',
            quantidade_cargos: cargos.length,
            data_atualizacao: setor.data_atualizacao || '—'
        };

    });

}


//----------------- EXPORTAÇÃO ------------------------------//

export default montarInformacoesSetores;