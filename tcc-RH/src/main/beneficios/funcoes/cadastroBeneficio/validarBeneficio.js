
//----------------- VALIDAÇÃO DO BENEFÍCIO -----------------------------//

function validarBeneficio(dadosBeneficio) {

    // Guardar os dados tratados para evitar erros caso algum campo esteja vazio
    const nome = (dadosBeneficio.nome || '').trim();
    const descricao = (dadosBeneficio.descricao || '').trim();

    const status = dadosBeneficio.status;
    const disponibilidade = dadosBeneficio.disponibilidade;

    const itensSelecionados = dadosBeneficio.itensSelecionados;


    // Guardar os erros encontrados
    const erros = {};


    //----------------- VALIDAR NOME -----------------------------//

    if (nome === '') {

        erros.nome = 'Informe o nome do benefício.';

    } else if (nome.length > 60) {

        erros.nome = 'O nome do benefício deve ter no máximo 60 caracteres.';

    }


    //----------------- VALIDAR DESCRIÇÃO -----------------------------//

    if (descricao === '') {

        erros.descricao = 'Informe a descrição do benefício.';

    } else if (descricao.length > 300) {

        erros.descricao = 'A descrição deve ter no máximo 300 caracteres.';

    }


    //----------------- VALIDAR STATUS -----------------------------//

    if (
        status !== 0 &&
        status !== 1 &&
        status !== '0' &&
        status !== '1'
    ) {

        erros.status = 'Selecione o status operacional do benefício.';

    }


    //----------------- VALIDAR DISPONIBILIDADE -----------------------------//

    if (
        !['TODOS', 'SETOR', 'CARGO'].includes(disponibilidade)
    ) {

        erros.disponibilidade = 'Selecione uma regra de disponibilidade válida.';

    }


    //----------------- VALIDAR SETORES E CARGOS -----------------------------//

    if (
        disponibilidade === 'SETOR' ||
        disponibilidade === 'CARGO'
    ) {

        if (
            !Array.isArray(itensSelecionados) ||
            itensSelecionados.length === 0
        ) {

            erros.itensSelecionados =
                disponibilidade === 'SETOR'
                    ? 'Selecione pelo menos um setor.'
                    : 'Selecione pelo menos um cargo.';

        }

    }


    //----------------- RETORNAR RESULTADO -----------------------------//

    return {

        valido: Object.keys(erros).length === 0,

        erros,

        nomeValido: !erros.nome,
        descricaoValida: !erros.descricao,
        statusValido: !erros.status,
        disponibilidadeValida: !erros.disponibilidade,
        itensSelecionadosValidos: !erros.itensSelecionados,

        erroNome: erros.nome || '',
        erroDescricao: erros.descricao || '',
        erroStatus: erros.status || '',
        erroDisponibilidade: erros.disponibilidade || '',
        erroItensSelecionados: erros.itensSelecionados || '',

        nomeComErro: Boolean(erros.nome),
        descricaoComErro: Boolean(erros.descricao),
        statusComErro: Boolean(erros.status),
        disponibilidadeComErro: Boolean(erros.disponibilidade),
        itensSelecionadosComErro: Boolean(erros.itensSelecionados)

    };

}


//----------------- EXPORTAÇÃO -----------------------------------//

export default validarBeneficio;
