
//----------------- IMPORTAÇÕES ----------------------------------------//

import buscarDadosColaboradores from '../../colaboradores/servicos/colaboradoresApi.js';


//----------------- CONFIGURAÇÕES DA API -------------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- FUNÇÃO PARA REALIZAR REQUISIÇÕES -------------------//

async function realizarRequisicao(url, token, dados) {

    const resposta = await fetch(`${API}/${url}`, {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },

        body: JSON.stringify(dados)

    });

    const resultado = await resposta.json().catch(() => ({}));

    // Verifica se a autenticação expirou.
    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error('Sua sessão expirou. Faça login novamente.');

    }

    // Verifica se a API retornou algum erro.
    if (!resposta.ok || resultado.status === false) {

        throw new Error(
            resultado.message ||
            resultado.mensagem ||
            `Não foi possível concluir a requisição: ${url}.`
        );

    }

    return resultado;

}


//----------------- OBTER ID DE SETOR OU CARGO -------------------------//

function obterIdVinculo(vinculo, tipo) {

    if (typeof vinculo === 'object' && vinculo !== null) {

        const campoId = tipo === 'SETOR'
            ? 'id_setor'
            : 'id_cargo';

        return Number(
            vinculo[campoId] ??
            vinculo.id ??
            vinculo[tipo.toLowerCase()]?.id
        );

    }

    return Number(vinculo);

}


//----------------- OBTER ID DO SETOR OU CARGO DO COLABORADOR ----------//

function obterIdRelacionamento(colaborador, tipo) {

    const campoId = tipo === 'SETOR'
        ? 'id_setor'
        : 'id_cargo';

    const relacionamento = tipo === 'SETOR'
        ? colaborador.setor
        : colaborador.cargo;

    return Number(
        colaborador[campoId] ??
        relacionamento?.[campoId] ??
        relacionamento?.id
    );

}


//----------------- REGISTRAR PARTICIPANTES ----------------------------//

async function registrarParticipantes(
    idAvaliacao,
    dadosAvaliacao,
    token
) {

    // Busca os colaboradores cadastrados no sistema.
    const dadosColaboradores = await buscarDadosColaboradores();

    // Mantém somente os colaboradores ativos.
    const colaboradoresAtivos = dadosColaboradores.colaboradores.filter(
        colaborador => colaborador.status === 'Ativo'
    );

    let participantesSelecionados = [];

    //----------------- PÚBLICO TODOS -------------------//

    if (dadosAvaliacao.publico_selecionado === 'TODOS') {

        participantesSelecionados = colaboradoresAtivos;

    }

    //----------------- PÚBLICO SETOR -------------------//

    else if (dadosAvaliacao.publico_selecionado === 'SETOR') {

        const setoresSelecionados = new Set(
            (dadosAvaliacao.setores_selecionados || [])
                .map(setor => obterIdVinculo(setor, 'SETOR'))
                .filter(id => Number.isInteger(id) && id > 0)
        );

        participantesSelecionados = colaboradoresAtivos.filter(
            colaborador => setoresSelecionados.has(
                obterIdRelacionamento(colaborador, 'SETOR')
            )
        );

    }

    //----------------- PÚBLICO CARGO -------------------//

    else if (dadosAvaliacao.publico_selecionado === 'CARGO') {

        const cargosSelecionados = new Set(
            (dadosAvaliacao.cargos_selecionados || [])
                .map(cargo => obterIdVinculo(cargo, 'CARGO'))
                .filter(id => Number.isInteger(id) && id > 0)
        );

        participantesSelecionados = colaboradoresAtivos.filter(
            colaborador => cargosSelecionados.has(
                obterIdRelacionamento(colaborador, 'CARGO')
            )
        );

    }

    else {

        throw new Error('O público selecionado é inválido.');

    }


    //----------------- VALIDAR PARTICIPANTES -------------//

    if (participantesSelecionados.length === 0) {

        throw new Error(
            'Nenhum colaborador ativo foi encontrado para o público selecionado.'
        );

    }


    //----------------- EVITAR PARTICIPANTES REPETIDOS ----//

    const participantesUnicos = [
        ...new Map(
            participantesSelecionados.map(colaborador => [
                Number(colaborador.id),
                colaborador
            ])
        ).values()
    ];


    //----------------- REGISTRAR PARTICIPAÇÕES -----------//

    for (const colaborador of participantesUnicos) {

        const idColaborador = Number(colaborador.id);

        if (!Number.isInteger(idColaborador) || idColaborador <= 0) {

            throw new Error(
                'Foi encontrado um colaborador com identificador inválido.'
            );

        }

        await realizarRequisicao(
            'avaliacao_participacao',
            token,
            {
                id_avaliacao: idAvaliacao,
                id_colaborador: idColaborador,
                status: 0
            }
        );

    }

    console.log(
        `${participantesUnicos.length} participantes registrados na avaliação ${idAvaliacao}.`
    );

    return participantesUnicos.length;

}


//----------------- CADASTRAR REGRAS DA AVALIAÇÃO ----------------------//

async function registrarRegrasAvaliacao(
    idAvaliacao,
    regrasSelecionadas,
    token
) {

    // Percorre todas as regras selecionadas no cadastro.
    for (const regra of regrasSelecionadas || []) {

        const idMotorRegras = Number(regra.id_motor_regras);

        const idFator = Number(regra.id_psicossocial_fator);

        // Valida os identificadores antes de enviar.
        if (
            !Number.isInteger(idMotorRegras) ||
            idMotorRegras <= 0 ||
            !Number.isInteger(idFator) ||
            idFator <= 0
        ) {

            throw new Error(
                'Uma das regras selecionadas possui identificadores inválidos.'
            );

        }

        // Registra o vínculo entre avaliação, regra e fator.
        await realizarRequisicao(
            'avaliacao_motor_regras',
            token,
            {
                id_avaliacao: idAvaliacao,
                id_motor_regras: idMotorRegras,
                id_psicossocial_fator: idFator
            }
        );

    }

    console.log(
        `${(regrasSelecionadas || []).length} regras vinculadas à avaliação ${idAvaliacao}.`
    );

}


//----------------- CADASTRAR AVALIAÇÃO -------------------------------//

async function cadastrarAvaliacaoPsicossocial(dadosAvaliacao) {

    const token = localStorage.getItem('access_token');

    if (!token) {

        throw new Error('Token não encontrado. Faça login novamente.');

    }

    try {

        // 1. CADASTRA A AVALIAÇÃO PRINCIPAL.

        const dados = await realizarRequisicao('avaliacao', token, {

            titulo: dadosAvaliacao.titulo,
            descricao: dadosAvaliacao.descricao,

            data_inicio: dadosAvaliacao.data_inicio,
            data_fim: dadosAvaliacao.data_fim,

            anonimo: Number(dadosAvaliacao.anonimo),
            status: Number(dadosAvaliacao.status),

            publico_selecionado: dadosAvaliacao.publico_selecionado

        });


        // Recupera o ID da avaliação cadastrada.

        const idAvaliacao = Number(dados?.response?.id);

        if (!Number.isInteger(idAvaliacao) || idAvaliacao <= 0) {

            throw new Error(
                'A avaliação foi cadastrada, mas não foi possível recuperar seu identificador.'
            );

        }


        // 2. CADASTRA OS FATORES SELECIONADOS.

        for (const fator of dadosAvaliacao.fatores_selecionados || []) {

            const idFator = Number(
                typeof fator === 'object'
                    ? fator.id_psicossocial_fator ?? fator.id
                    : fator
            );

            if (!Number.isInteger(idFator) || idFator <= 0) {

                throw new Error(
                    'Um dos fatores selecionados possui um identificador inválido.'
                );

            }

            await realizarRequisicao('avaliacao_fator', token, {

                id_avaliacao: idAvaliacao,
                id_psicossocial_fator: idFator

            });

        }


        // 3. CADASTRA AS REGRAS SELECIONADAS.

        await registrarRegrasAvaliacao(
            idAvaliacao,
            dadosAvaliacao.regras_selecionadas,
            token
        );


        // 4. CADASTRA OS SETORES, CASO O PÚBLICO SEJA SETOR.

        if (dadosAvaliacao.publico_selecionado === 'SETOR') {

            for (const setor of dadosAvaliacao.setores_selecionados || []) {

                const idSetor = obterIdVinculo(setor, 'SETOR');

                if (!Number.isInteger(idSetor) || idSetor <= 0) {

                    throw new Error(
                        'Um dos setores selecionados possui um identificador inválido.'
                    );

                }

                await realizarRequisicao('avaliacao_setor', token, {

                    id_avaliacao: idAvaliacao,
                    id_setor: idSetor

                });

            }

        }


        // 5. CADASTRA OS CARGOS, CASO O PÚBLICO SEJA CARGO.

        if (dadosAvaliacao.publico_selecionado === 'CARGO') {

            for (const cargo of dadosAvaliacao.cargos_selecionados || []) {

                const idCargo = obterIdVinculo(cargo, 'CARGO');

                if (!Number.isInteger(idCargo) || idCargo <= 0) {

                    throw new Error(
                        'Um dos cargos selecionados possui um identificador inválido.'
                    );

                }

                await realizarRequisicao('avaliacao_cargo', token, {

                    id_avaliacao: idAvaliacao,
                    id_cargo: idCargo

                });

            }

        }


        // 6. REGISTRA AUTOMATICAMENTE OS PARTICIPANTES.

        const quantidadeParticipantes = await registrarParticipantes(
            idAvaliacao,
            dadosAvaliacao,
            token
        );


        // Retorna os dados da avaliação cadastrada.

        return {
            ...dados,
            quantidade_participantes: quantidadeParticipantes
        };

    } catch (erro) {

        console.error(
            'Erro ao cadastrar avaliação psicossocial:',
            erro
        );

        throw erro;

    }

}


//----------------- EXPORTAÇÃO ----------------------------------------//

export default cadastrarAvaliacaoPsicossocial;
