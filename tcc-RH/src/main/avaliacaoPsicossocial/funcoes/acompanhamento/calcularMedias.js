
function calcularMedias(
    respostasValidas,
    fatores,
    setoresAvaliacao,
    quantidadeMinima = 5
) {

    const resultados = [];

    // Percorre todos os fatores da avaliação.
    fatores.forEach((fator) => {

        const respostasFator = respostasValidas.filter((resposta) => {
            return Number(resposta.idFator) === Number(fator.id);
        });

        const colaboradoresGeral = new Set();

        respostasFator.forEach((resposta) => {
            colaboradoresGeral.add(resposta.idColaborador);
        });

        const somaGeral = respostasFator.reduce(
            (total, resposta) => total + resposta.valor,
            0
        );

        const mediaGeral = respostasFator.length > 0
            ? Number((somaGeral / respostasFator.length).toFixed(2))
            : 0;

        // Cria os resultados de todos os setores da avaliação.
        const setores = setoresAvaliacao.map((setor) => {

            const respostasSetor = respostasFator.filter((resposta) => {
                return Number(resposta.idSetor) === Number(setor.idSetor);
            });

            const colaboradoresSetor = new Set();

            respostasSetor.forEach((resposta) => {
                colaboradoresSetor.add(resposta.idColaborador);
            });

            const quantidadeParticipantes = colaboradoresSetor.size;

            const somaSetor = respostasSetor.reduce(
                (total, resposta) => total + resposta.valor,
                0
            );

            // Sem respostas, a barra aparece zerada.
            if (respostasSetor.length === 0) {

                return {
                    idSetor: setor.idSetor,
                    nomeSetor: setor.nomeSetor,
                    quantidadeParticipantes: 0,
                    media: 0,
                    disponivel: true,
                    semRespostas: true
                };

            }

            // Mantém a proteção de anonimato.
            if (quantidadeParticipantes < quantidadeMinima) {

                return {
                    idSetor: setor.idSetor,
                    nomeSetor: setor.nomeSetor,
                    quantidadeParticipantes,
                    media: null,
                    disponivel: false,
                    semRespostas: false
                };

            }

            return {
                idSetor: setor.idSetor,
                nomeSetor: setor.nomeSetor,
                quantidadeParticipantes,
                media: Number(
                    (somaSetor / respostasSetor.length).toFixed(2)
                ),
                disponivel: true,
                semRespostas: false
            };

        });

        resultados.push({

            idFator: fator.id,

            quantidadeParticipantes: colaboradoresGeral.size,

            quantidadeRespostas: respostasFator.length,

            mediaGeral,

            setores

        });

    });

    return resultados;

}

export default calcularMedias;
