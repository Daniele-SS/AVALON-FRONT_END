
//----------------- MONTAR INFORMAÇÕES DOS BENEFÍCIOS --------------------//

// Verifica se um status representa um registro ativo.
function estaAtivo(status) {

    return (
        status === true ||
        Number(status) === 1 ||
        String(status).toLowerCase() === 'ativo'
    );

}


// Obtém uma lista mesmo quando a API retorna um único objeto.
function transformarEmLista(dados) {

    if (Array.isArray(dados)) {
        return dados;
    }

    if (dados && typeof dados === 'object') {
        return [dados];
    }

    return [];

}


// Obtém os benefícios relacionados a um vínculo.
function obterBeneficiosDoVinculo(vinculo) {

    const beneficio = vinculo.beneficio;

    // Formato usado pela API: beneficio.beneficios.
    if (beneficio && Array.isArray(beneficio.beneficios)) {
        return beneficio.beneficios;
    }

    // Caso a API retorne o benefício diretamente como objeto.
    if (beneficio && !Array.isArray(beneficio.beneficios)) {
        if (beneficio.id !== undefined) {
            return [beneficio];
        }
    }

    return [];
}


// Obtém os colaboradores relacionados a um vínculo.
function obterColaboradoresDoVinculo(vinculo) {

    return transformarEmLista(vinculo.colaborador);
}


//----------------- FUNÇÃO PRINCIPAL -------------------------------------//

function montarInformacoesBeneficios(
    beneficios,
    vinculos,
    colaboradores
) {

    // Garante que os dados sejam listas.
    const listaBeneficios = transformarEmLista(beneficios);
    const listaVinculos = transformarEmLista(vinculos);
    const listaColaboradores = transformarEmLista(colaboradores);

    // Mantém somente os colaboradores ativos.
    const colaboradoresAtivos = listaColaboradores.filter(
        colaborador => estaAtivo(colaborador.status)
    );

    // Guarda os IDs dos colaboradores ativos.
    const idsColaboradoresAtivos = new Set(
        colaboradoresAtivos.map(colaborador =>
            Number(colaborador.id ?? colaborador.id_colaborador)
        )
    );

    // Guarda os colaboradores distintos que recebem algum benefício.
    const idsColaboradoresBeneficiados = new Set();

    // Monta as informações de cada benefício.
    const beneficiosComInformacoes = listaBeneficios.map(beneficio => {

        // Confere se o benefício está ativo.
        const beneficioAtivo = estaAtivo(beneficio.status);

        // Guarda os colaboradores deste benefício sem duplicá-los.
        const colaboradoresPorId = new Map();

        // Só contabiliza colaboradores de benefícios ativos.
        if (beneficioAtivo) {

            // Percorre todos os vínculos retornados pela API.
            listaVinculos.forEach(vinculo => {

                // Ignora vínculos inativos.
                if (!estaAtivo(vinculo.ativo)) {
                    return;
                }

                // Ignora vínculos cuja data final já passou.
                if (vinculo.data_fim) {

                    const dataFim = new Date(vinculo.data_fim);

                    if (!Number.isNaN(dataFim.getTime())) {

                        dataFim.setHours(23, 59, 59, 999);

                        if (dataFim < new Date()) {
                            return;
                        }

                    }

                }

                // Verifica se o vínculo pertence ao benefício atual.
                const beneficiosVinculados =
                    obterBeneficiosDoVinculo(vinculo);

                const pertenceAoBeneficio =
                    beneficiosVinculados.some(item => {

                        const idBeneficioVinculado = Number(
                            item.id ?? item.id_beneficio
                        );

                        const idBeneficioAtual = Number(
                            beneficio.id ?? beneficio.id_beneficio
                        );

                        return (
                            idBeneficioVinculado === idBeneficioAtual
                        );

                    });

                // Se não pertence, passa para o próximo vínculo.
                if (!pertenceAoBeneficio) {
                    return;
                }

                // Obtém os colaboradores desse vínculo.
                const colaboradoresVinculados =
                    obterColaboradoresDoVinculo(vinculo);

                colaboradoresVinculados.forEach(colaborador => {

                    const idColaborador = Number(
                        colaborador.id ?? colaborador.id_colaborador
                    );

                    // Ignora registros sem identificação válida.
                    if (!Number.isFinite(idColaborador)) {
                        return;
                    }

                    // Procura o colaborador na lista geral.
                    const colaboradorCadastrado =
                        listaColaboradores.find(item => {

                            const idCadastrado = Number(
                                item.id ?? item.id_colaborador
                            );

                            return idCadastrado === idColaborador;

                        });

                    // Ignora colaboradores inativos quando o cadastro
                    // geral informa seu status.
                    if (
                        colaboradorCadastrado &&
                        !estaAtivo(colaboradorCadastrado.status)
                    ) {
                        return;
                    }

                    // Guarda o registro completo do colaborador.
                    colaboradoresPorId.set(
                        idColaborador,
                        {
                            ...colaborador,
                            ...(colaboradorCadastrado || {}),
                            id: idColaborador
                        }
                    );

                    // Conta essa pessoa apenas uma vez no indicador geral.
                    idsColaboradoresBeneficiados.add(idColaborador);

                });

            });

        }

        // Transforma os colaboradores em uma lista para o card.
        const colaboradoresVinculados = Array.from(
            colaboradoresPorId.values()
        );

        // Quantidade de pessoas distintas vinculadas ao benefício.
        const quantidadeColaboradores = colaboradoresVinculados.length;

        // Total usado como base para calcular a porcentagem.
        const totalColaboradoresAtivos = colaboradoresAtivos.length;

        // Calcula a porcentagem de adesão do benefício.
        const percentualAdesao =
            totalColaboradoresAtivos > 0
                ? Math.round(
                    (quantidadeColaboradores / totalColaboradoresAtivos) * 100
                )
                : 0;

        // Retorna o benefício com os dados calculados.
        return {
            ...beneficio,
            colaboradores_vinculados: colaboradoresVinculados,
            quantidade_colaboradores: quantidadeColaboradores,
            percentual_adesao: percentualAdesao
        };

    });

    // Retorna os benefícios e os indicadores gerais.
    return {
        beneficios: beneficiosComInformacoes,
        totalColaboradoresAtivos: colaboradoresAtivos.length,
        totalColaboradoresBeneficiados:
            idsColaboradoresBeneficiados.size
    };

}


//----------------- EXPORTAÇÃO -------------------------------------------//

export default montarInformacoesBeneficios;
