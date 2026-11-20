
/********************************************************************************
 * Objetivo: Calcular as médias gerais e por setor dos fatores psicossociais,
 *           considerando somente os colaboradores que responderam.
 *           Respeita o mínimo de participantes para proteger o anonimato.
 ********************************************************************************/


//----------------- CALCULAR MÉDIAS -------------------------//

function calcularMedias(
    respostasValidas,
    fatores,
    setoresAvaliacao,
    quantidadeMinima = 1
) {

    const resultados = [];


    // Percorre todos os fatores da avaliação.
    fatores.forEach((fator) => {


        //----------------- RESPOSTAS DO FATOR ----------------//

        const respostasFator = respostasValidas.filter((resposta) => {

            return Number(resposta.idFator) === Number(fator.id);

        });


        //----------------- PARTICIPANTES GERAIS --------------//

        // Conta colaboradores diferentes que responderam ao fator.
        const colaboradoresGeral = new Set(

            respostasFator.map((resposta) =>
                Number(resposta.idColaborador)
            )

        );

        const quantidadeParticipantesGeral = colaboradoresGeral.size;


        //----------------- MÉDIA GERAL -----------------------//

        const somaGeral = respostasFator.reduce(
            (total, resposta) => total + resposta.valor,
            0
        );


        // Só libera a média quando atingir o mínimo de participantes.
        const mediaGeral = quantidadeParticipantesGeral >= quantidadeMinima
            ? Number((somaGeral / respostasFator.length).toFixed(2))
            : null;


        //----------------- RESULTADOS POR SETOR --------------//

        const setores = setoresAvaliacao.map((setor) => {

            const respostasSetor = respostasFator.filter((resposta) => {

                return Number(resposta.idSetor) === Number(setor.idSetor);

            });


            // Conta colaboradores diferentes naquele setor.
            const colaboradoresSetor = new Set(

                respostasSetor.map((resposta) =>
                    Number(resposta.idColaborador)
                )

            );

            const quantidadeParticipantes = colaboradoresSetor.size;


            //----------------- SETOR SEM RESPOSTAS ------------//

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


            //----------------- PROTEÇÃO DO ANONIMATO ----------//

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


            //----------------- CALCULAR MÉDIA DO SETOR --------//

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


        //----------------- ARMAZENAR RESULTADO ----------------//

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


//----------------- EXPORTAÇÃO ------------------------------//

export default calcularMedias;
