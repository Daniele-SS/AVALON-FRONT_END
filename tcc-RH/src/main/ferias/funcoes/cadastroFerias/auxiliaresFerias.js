function obterPrimeiroItem(valor) {
    return Array.isArray(valor)
        ? valor[0] ?? null
        : valor ?? null;
}

export function obterSetor(colaborador) {
    const setor = obterPrimeiroItem(
        colaborador?.setor
    );

    return setor?.nome || 'Não informado';
}

export function obterCargo(colaborador) {
    const cargo = colaborador?.cargo;

    const classificacao =
        Array.isArray(cargo?.classificacao)
            ? cargo.classificacao[0]
            : cargo?.classificacao;

    return classificacao?.nome || 'Não informado';
}

export function obterNivelAcesso(usuario) {
    const nivel = usuario?.nivel_acesso;

    const lista =
        Array.isArray(nivel?.nivel_acesso)
            ? nivel.nivel_acesso
            : Array.isArray(nivel)
                ? nivel
                : [];

    return lista[0]?.nome || '';
}

export function colaboradorDoUsuario(usuario) {
    return Array.isArray(usuario?.colaborador)
        ? usuario.colaborador[0] ?? null
        : usuario?.colaborador ?? null;
}

export function normalizarColaboradores(dados) {
    if (Array.isArray(dados)) {
        return dados;
    }

    if (Array.isArray(dados?.response?.colaborador)) {
        return dados.response.colaborador;
    }

    if (Array.isArray(dados?.response?.colaboradores)) {
        return dados.response.colaboradores;
    }

    if (Array.isArray(dados?.colaborador)) {
        return dados.colaborador;
    }

    if (Array.isArray(dados?.colaboradores)) {
        return dados.colaboradores;
    }

    return [];
}

export function normalizarUsuarios(dados) {
    if (Array.isArray(dados)) {
        return dados;
    }

    if (Array.isArray(dados?.response?.usuario)) {
        return dados.response.usuario;
    }

    if (Array.isArray(dados?.usuario)) {
        return dados.usuario;
    }

    return [];
}