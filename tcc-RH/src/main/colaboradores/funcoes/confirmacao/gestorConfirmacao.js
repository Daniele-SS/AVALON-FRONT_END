
//----------------- COLABORADORES DO USUÁRIO ------------------------//

import {
    colaboradorEstaAtivo,
    nivelEstaAtivo,
    obterIdSetor
} from './formatacaoConfirmacao.js';

export function obterColaboradoresDoUsuario(usuario) {
    const vinculados = usuario?.colaborador;

    if (Array.isArray(vinculados)) {
        return vinculados;
    }

    if (vinculados && typeof vinculados === 'object') {
        return [vinculados];
    }

    return [];
}

//----------------- NÍVEL DE ACESSO ---------------------------------//

export function obterNivelDeAcesso(usuario) {
    let nivel =
        usuario?.nivel_acesso?.nivel_acesso ??
        usuario?.nivel_acesso ??
        usuario?.nivelAcesso ??
        null;

    if (Array.isArray(nivel)) {
        nivel = nivel[0] ?? null;
    }

    return nivel;
}

//----------------- ENCONTRAR GESTOR DO SETOR -----------------------//

export function encontrarGestorDoSetor(usuarios, idSetor) {
    if (idSetor === undefined || idSetor === null || idSetor === '') {
        return 'Não informado';
    }

    const usuarioGestor = usuarios.find((usuario) => {
        const nivel = obterNivelDeAcesso(usuario);

        const nomeNivel = String(
            nivel?.nome ?? nivel?.nivel ?? ''
        ).trim().toLowerCase();

        if (nomeNivel !== 'gestor' || !nivelEstaAtivo(nivel)) {
            return false;
        }

        return obterColaboradoresDoUsuario(usuario).some(
            (colaborador) => (
                colaboradorEstaAtivo(colaborador) &&
                String(obterIdSetor(colaborador)) === String(idSetor)
            )
        );
    });

    if (!usuarioGestor) {
        return 'Não informado';
    }

    const gestor = obterColaboradoresDoUsuario(usuarioGestor).find(
        (colaborador) => (
            colaboradorEstaAtivo(colaborador) &&
            String(obterIdSetor(colaborador)) === String(idSetor)
        )
    );

    return (
        gestor?.nome ||
        gestor?.nome_colaborador ||
        gestor?.nome_completo ||
        'Não informado'
    );
}
