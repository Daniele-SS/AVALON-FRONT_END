
import classificarResultados from './classificarResultados.js';

function montarResultadosFatores(fatores, medias, regras) {

    return fatores

        .filter((fator) => Number(fator.ativo) === 1)

        .map((fator) => {

            const resultadoMedia = medias.find((item) => {

                return Number(item.idFator) === Number(fator.id);

            });

            // Caso não exista resultado, mantém valores zerados.
            if (!resultadoMedia) {

                return {
                    id: fator.id,
                    nome: fator.nome,
                    descricao: fator.descricao,
                    quantidadeParticipantes: 0,
                    quantidadeRespostas: 0,
                    mediaGeral: 0,
                    classificacao: 'Sem respostas',
                    acao: '',
                    setores: []
                };

            }

            // Não aplica regras quando não existem respostas.
            const classificacaoGeral =
                resultadoMedia.quantidadeRespostas > 0
                    ? classificarResultados(
                        resultadoMedia.mediaGeral,
                        fator.id,
                        regras
                    )
                    : {
                        classificacao: 'Sem respostas',
                        acao: ''
                    };

            // Monta os resultados por setor.
            const setores = resultadoMedia.setores.map((setor) => {

                let classificacaoSetor;

                if (setor.semRespostas) {

                    classificacaoSetor = {
                        classificacao: 'Sem respostas',
                        acao: ''
                    };

                } else if (!setor.disponivel) {

                    classificacaoSetor = {
                        classificacao: 'Dados indisponíveis',
                        acao: ''
                    };

                } else {

                    classificacaoSetor = classificarResultados(
                        setor.media,
                        fator.id,
                        regras
                    );

                }

                return {
                    ...setor,
                    ...classificacaoSetor
                };

            });

            return {

                id: fator.id,
                nome: fator.nome,
                descricao: fator.descricao,

                quantidadeParticipantes:
                    resultadoMedia.quantidadeParticipantes,

                quantidadeRespostas:
                    resultadoMedia.quantidadeRespostas,

                mediaGeral: resultadoMedia.mediaGeral,

                ...classificacaoGeral,

                setores

            };

        });

}

export default montarResultadosFatores;
