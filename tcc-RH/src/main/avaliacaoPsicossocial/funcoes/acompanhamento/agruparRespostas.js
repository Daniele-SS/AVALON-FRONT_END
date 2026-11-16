
function agruparRespostas(participacoes, respostas) {

    const respostasValidas = [];
    const setoresAvaliacao = [];

    // Percorre todas as participações da avaliação.
    participacoes.forEach((participacao) => {

        const colaboradores = Array.isArray(participacao.colaborador)
            ? participacao.colaborador
            : participacao.colaborador
                ? [participacao.colaborador]
                : [];

        colaboradores.forEach((colaborador) => {

            // Considera somente colaboradores ativos.
            if (colaborador.status !== 'Ativo') {
                return;
            }

            const setores = Array.isArray(colaborador.setor)
                ? colaborador.setor
                : colaborador.setor
                    ? [colaborador.setor]
                    : [];

            // Registra os setores mesmo sem respostas.
            setores.forEach((setor) => {

                if (!setor?.id) {
                    return;
                }

                const existeSetor = setoresAvaliacao.some((item) => {
                    return Number(item.idSetor) === Number(setor.id);
                });

                if (!existeSetor) {
                    setoresAvaliacao.push({
                        idSetor: setor.id,
                        nomeSetor: setor.nome
                    });
                }

            });

            // Somente participações concluídas entram nos cálculos.
            if (Number(participacao.status) !== 1) {
                return;
            }

            // Busca as respostas da participação.
            const respostasParticipacao = respostas.filter((resposta) => {

                return Number(resposta.id_avaliacao_participacao)
                    === Number(participacao.id);

            });

            respostasParticipacao.forEach((resposta) => {

                const valor = Number(resposta.valor);
                const idFator = Number(resposta.id_psicossocial_fator);

                // Ignora valores inválidos.
                if (
                    !Number.isFinite(valor) ||
                    valor < 1 ||
                    valor > 5 ||
                    !idFator
                ) {
                    return;
                }

                setores.forEach((setor) => {

                    if (!setor?.id) {
                        return;
                    }

                    respostasValidas.push({
                        idParticipacao: participacao.id,
                        idColaborador: colaborador.id,
                        nomeColaborador: colaborador.nome,
                        idSetor: setor.id,
                        nomeSetor: setor.nome,
                        idFator,
                        valor
                    });

                });

            });

        });

    });

    return {
        respostasValidas,
        setoresAvaliacao
    };

}

export default agruparRespostas;
