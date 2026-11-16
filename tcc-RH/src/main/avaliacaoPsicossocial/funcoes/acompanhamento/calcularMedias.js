
/********************************************************************************
 * Objetivo: Calcular as médias gerais e por setor dos fatores psicossociais,
 *           considerando somente os colaboradores que responderam.
 ********************************************************************************/

function calcularMedias(
    respostasValidas,
    fatores,
    setoresAvaliacao,
    quantidadeMinima = 1
) {

    const resultados = [];

    // Percorre todos os fatores da avaliação.
    fatores.forEach((fator) => {

        // Busca somente as respostas válidas do fator.
        const respostasFator = respostasValidas.filter((resposta) => {

            return Number(resposta.idFator) === Number(fator.id);

        });

        // Identifica somente os colaboradores que responderam.
        const colaboradoresGeral = new Set(
            respostasFator.map((resposta) => Number(resposta.idColaborador))
        );

        const quantidadeParticipantesGeral = colaboradoresGeral.size;

        // Soma somente as respostas recebidas.
        const somaGeral = respostasFator.reduce(
            (total, resposta) => total + resposta.valor,
            0
        );

        // A média geral não exige quantidade mínima de participantes.
        const mediaGeral = respostasFator.length > 0
            ? Number((somaGeral / respostasFator.length).toFixed(2))
            : null;


        // Calcula os resultados de cada setor.
        const setores = setoresAvaliacao.map((setor) => {

            const respostasSetor = respostasFator.filter((resposta) => {

                return Number(resposta.idSetor) === Number(setor.idSetor);

            });

            // Identifica somente quem respondeu naquele setor.
            const colaboradoresSetor = new Set(
                respostasSetor.map((resposta) => Number(resposta.idColaborador))
            );

            const quantidadeParticipantes = colaboradoresSetor.size;

            // Setor sem respostas.
            if (respostasSetor.length === 0) {

                return {
                    idSetor: setor.idSetor,
                    nomeSetor: setor.nomeSetor,
                    quantidadeParticipantes: 0,
                    media: null,
                    disponivel: false,
                    semRespostas: true
                };

            }

            // Proteção de anonimato por setor.
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

            // Calcula a média somente com as respostas daquele setor.
            const somaSetor = respostasSetor.reduce(
                (total, resposta) => total + resposta.valor,
                0
            );

            const mediaSetor = Number(
                (somaSetor / respostasSetor.length).toFixed(2)
            );

            return {
                idSetor: setor.idSetor,
                nomeSetor: setor.nomeSetor,
                quantidadeParticipantes,
                media: mediaSetor,
                disponivel: true,
                semRespostas: false
            };

        });


        // Armazena os resultados do fator.
        resultados.push({

            idFator: fator.id,

            quantidadeParticipantes: quantidadeParticipantesGeral,

            quantidadeRespostas: respostasFator.length,

            mediaGeral,

            setores

        });

    });

    return resultados;

}

export default calcularMedias;
