//----------------- MONTAR INFORMAÇÕES DOS CARGOS ------------//

function montarInformacoesCargos(cargos, colaboradores, setores) {
    const resultado = [];

    cargos.forEach(cargo => {

        // Buscar colaboradores vinculados ao cargo
        const colaboradoresCargo = colaboradores.filter(colaborador => {
            const cargoColaborador =
                colaborador.cargo?.classificacao?.[0];

            const idCargo =
                colaborador.id_cargo ??
                cargoColaborador?.id ??
                colaborador.cargo?.id;

            return Number(idCargo) === Number(cargo.id);
        });

        // Identificar os setores que possuem esse cargo
        const setoresCargo = [];

        colaboradoresCargo.forEach(colaborador => {
            const setorColaborador = colaborador.setor?.[0];

            const idSetor =
                colaborador.id_setor ??
                setorColaborador?.id ??
                colaborador.setor?.id;

            const setorEncontrado = setores.find(
                setor => Number(setor.id) === Number(idSetor)
            );

            if (
                setorEncontrado &&
                !setoresCargo.some(
                    setor => Number(setor.id) === Number(setorEncontrado.id)
                )
            ) {
                setoresCargo.push(setorEncontrado);
            }
        });

        // Exibir cargos sem colaboradores vinculados
        if (setoresCargo.length === 0) {
            resultado.push({
                ...cargo,
                id: `${cargo.id}-sem-setor`,
                cargo_id: cargo.id,
                nome_cargo: cargo.nome,
                nome_setor: '—',
                quantidade_colaboradores: 0
            });

            return;
        }

        // Criar uma linha para cada setor do cargo
        setoresCargo.forEach(setor => {
            const colaboradoresSetor = colaboradoresCargo.filter(
                colaborador => {
                    const setorColaborador = colaborador.setor?.[0];

                    const idSetor =
                        colaborador.id_setor ??
                        setorColaborador?.id ??
                        colaborador.setor?.id;

                    return Number(idSetor) === Number(setor.id);
                }
            );

            // Contar apenas colaboradores ativos
            const quantidadeColaboradores = colaboradoresSetor.filter(
                colaborador =>
                    String(colaborador.status).toLowerCase() === 'ativo' ||
                    Number(colaborador.status) === 1
            ).length;

            resultado.push({
                ...cargo,
                id: `${cargo.id}-${setor.id}`,
                cargo_id: cargo.id,
                nome_cargo: cargo.nome,
                nome_setor: setor.nome,
                quantidade_colaboradores: quantidadeColaboradores
            });
        });
    });

    return resultado;
}

//----------------- EXPORTAÇÃO ------------------------------//

export default montarInformacoesCargos;