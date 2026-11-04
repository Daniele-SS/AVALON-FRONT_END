
//----------------- CONFIGURAÇÃO DA API -----------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO --------------------------//

function obterConfiguracao() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

}


//----------------- REALIZAR REQUISIÇÃO -------------------------------//

async function realizarRequisicao(url, configuracao = {}, aceitar404 = false) {

    const resposta = await fetch(url, {
        ...configuracao,
        headers: {
            ...obterConfiguracao(),
            ...configuracao.headers
        }
    });

    const dados = await resposta.json().catch(() => ({}));

    // Verifica se a autenticação expirou.
    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }

    // Quando não existem vínculos, o backend pode retornar 404.
    if (resposta.status === 404 && aceitar404) {
        return dados;
    }

    // Verifica erros da requisição.
    if (!resposta.ok || dados.status === false) {

        throw new Error(
            dados.message ||
            dados.mensagem ||
            dados.error ||
            'Não foi possível realizar a operação.'
        );

    }

    return dados;

}


//----------------- BUSCAR VÍNCULOS DE SETORES -----------------------//

async function buscarVinculosSetores(idBeneficio) {

    const dados = await realizarRequisicao(
        `${API}/beneficio_setor`,
        {
            method: 'GET'
        },
        true
    );

    // O controller retorna a lista em beneficioSetores.
    const vinculos = dados.response?.beneficioSetores || [];

    // Retorna somente os vínculos do benefício selecionado.
    return vinculos.filter((vinculo) => {

        const idBeneficioVinculado =
            vinculo.beneficio?.id ??
            vinculo.id_beneficio;

        return Number(idBeneficioVinculado) === Number(idBeneficio);

    });

}


//----------------- BUSCAR VÍNCULOS DE CARGOS ------------------------//

async function buscarVinculosCargos(idBeneficio) {

    const dados = await realizarRequisicao(
        `${API}/beneficio_cargo`,
        {
            method: 'GET'
        },
        true
    );

    // O controller retorna a lista em beneficioCargo.
    const vinculos = dados.response?.beneficioCargo || [];

    // Retorna somente os vínculos do benefício selecionado.
    return vinculos.filter((vinculo) => {

        const idBeneficioVinculado =
            vinculo.beneficio?.id ??
            vinculo.id_beneficio;

        return Number(idBeneficioVinculado) === Number(idBeneficio);

    });

}


//----------------- SINCRONIZAR VÍNCULOS DE SETORES ------------------//

async function sincronizarSetores(idBeneficio, setoresSelecionados) {

    // Busca os vínculos que já existem no banco.
    const setoresExistentes = await buscarVinculosSetores(idBeneficio);

    // IDs dos setores que o usuário manteve selecionados.
    const idsSelecionados = setoresSelecionados.map(
        (setor) => Number(setor.id)
    );


    //----------------- EXCLUIR VÍNCULOS REMOVIDOS -------------------//

    for (const vinculo of setoresExistentes) {

        const idSetor =
            vinculo.setor?.id ??
            vinculo.id_setor;

        // Se o setor não está mais selecionado, exclui o vínculo.
        if (!idsSelecionados.includes(Number(idSetor))) {

            if (vinculo.id == null) {
                throw new Error(
                    'Não foi possível identificar um vínculo de setor para exclusão.'
                );
            }

            await realizarRequisicao(
                `${API}/beneficio_setor/${vinculo.id}`,
                {
                    method: 'DELETE'
                }
            );

        }

    }


    //----------------- CADASTRAR NOVOS VÍNCULOS ---------------------//

    for (const setor of setoresSelecionados) {

        // Verifica se o setor já está vinculado.
        const jaExiste = setoresExistentes.some((vinculo) => {

            const idSetor =
                vinculo.setor?.id ??
                vinculo.id_setor;

            return Number(idSetor) === Number(setor.id);

        });

        // Cadastra somente os setores que ainda não possuem vínculo.
        if (!jaExiste) {

            await realizarRequisicao(
                `${API}/beneficio_setor`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        id_beneficio: Number(idBeneficio),
                        id_setor: Number(setor.id)
                    })
                }
            );

        }

    }

}


//----------------- SINCRONIZAR VÍNCULOS DE CARGOS ------------------//

async function sincronizarCargos(idBeneficio, cargosSelecionados) {

    // Busca os vínculos que já existem no banco.
    const cargosExistentes = await buscarVinculosCargos(idBeneficio);

    // IDs dos cargos que o usuário manteve selecionados.
    const idsSelecionados = cargosSelecionados.map(
        (cargo) => Number(cargo.id)
    );


    //----------------- EXCLUIR VÍNCULOS REMOVIDOS -------------------//

    for (const vinculo of cargosExistentes) {

        const idCargo =
            vinculo.cargo?.id ??
            vinculo.id_cargo;

        // Se o cargo não está mais selecionado, exclui o vínculo.
        if (!idsSelecionados.includes(Number(idCargo))) {

            if (vinculo.id == null) {
                throw new Error(
                    'Não foi possível identificar um vínculo de cargo para exclusão.'
                );
            }

            await realizarRequisicao(
                `${API}/beneficio_cargo/${vinculo.id}`,
                {
                    method: 'DELETE'
                }
            );

        }

    }


    //----------------- CADASTRAR NOVOS VÍNCULOS ---------------------//

    for (const cargo of cargosSelecionados) {

        // Verifica se o cargo já está vinculado.
        const jaExiste = cargosExistentes.some((vinculo) => {

            const idCargo =
                vinculo.cargo?.id ??
                vinculo.id_cargo;

            return Number(idCargo) === Number(cargo.id);

        });

        // Cadastra somente os cargos que ainda não possuem vínculo.
        if (!jaExiste) {

            await realizarRequisicao(
                `${API}/beneficio_cargo`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        id_beneficio: Number(idBeneficio),
                        id_cargo: Number(cargo.id)
                    })
                }
            );

        }

    }

}


//----------------- ATUALIZAR BENEFÍCIO E SEUS VÍNCULOS --------------//

async function editarBeneficioApi(idBeneficio, dadosBeneficio) {

    //----------------- VALIDAR ID -------------------------------//

    if (!idBeneficio || isNaN(idBeneficio)) {
        throw new Error('ID do benefício inválido.');
    }


    //----------------- ATUALIZAR DADOS PRINCIPAIS ---------------//

    await realizarRequisicao(
        `${API}/beneficio/${idBeneficio}`,
        {
            method: 'PUT',
            body: JSON.stringify({
                nome: dadosBeneficio.nome,
                descricao: dadosBeneficio.descricao,
                status: Number(dadosBeneficio.status),
                disponibilidade: dadosBeneficio.disponibilidade
            })
        }
    );


    //----------------- PREPARAR SELEÇÕES ------------------------//

    const itensSelecionados = Array.isArray(
        dadosBeneficio.itensSelecionados
    )
        ? dadosBeneficio.itensSelecionados
        : [];


    //----------------- ATUALIZAR VÍNCULOS ------------------------//

    // Disponibilidade para todos: remove os vínculos específicos.
    if (dadosBeneficio.disponibilidade === 'TODOS') {

        await sincronizarSetores(idBeneficio, []);
        await sincronizarCargos(idBeneficio, []);

    }

    // Disponibilidade por setor.
    else if (dadosBeneficio.disponibilidade === 'SETOR') {

        await sincronizarSetores(idBeneficio, itensSelecionados);

        // Remove vínculos antigos com cargos.
        await sincronizarCargos(idBeneficio, []);

    }

    // Disponibilidade por cargo.
    else if (dadosBeneficio.disponibilidade === 'CARGO') {

        await sincronizarCargos(idBeneficio, itensSelecionados);

        // Remove vínculos antigos com setores.
        await sincronizarSetores(idBeneficio, []);

    }

    else {

        throw new Error('Disponibilidade do benefício inválida.');

    }


    //----------------- RETORNO ----------------------------------//

    return {
        sucesso: true,
        mensagem: 'Benefício atualizado com sucesso.'
    };

}


//----------------- EXPORTAÇÃO ---------------------------------------//

export {
    buscarVinculosSetores,
    buscarVinculosCargos
};

export default editarBeneficioApi;
