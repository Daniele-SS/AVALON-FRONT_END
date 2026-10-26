import {
    obterSetor,
    obterNivelAcesso,
    colaboradorDoUsuario
} from './auxiliaresFerias.js';

function buscarGestorColaborador(
    colaborador,
    usuarios
) {
    if (!colaborador) {
        return null;
    }

    const gestorExplicito =
        colaborador?.gestor ??
        colaborador?.gestor_imediato ??
        colaborador?.gestorImediato;

    if (gestorExplicito) {
        return gestorExplicito;
    }

    const setorColaborador =
        obterSetor(colaborador)
            .trim()
            .toLowerCase();

    if (
        !setorColaborador ||
        setorColaborador === 'não informado'
    ) {
        return null;
    }

    const gestoresDoMesmoSetor =
        usuarios
            .filter(usuario => {
                const nivel =
                    obterNivelAcesso(usuario)
                        .trim()
                        .toLowerCase();

                if (nivel !== 'gestor') {
                    return false;
                }

                const colaboradorGestor =
                    colaboradorDoUsuario(usuario);

                if (!colaboradorGestor) {
                    return false;
                }

                const status =
                    String(
                        colaboradorGestor.status ?? ''
                    ).toLowerCase();

                if (
                    status !== 'ativo' &&
                    status !== '1'
                ) {
                    return false;
                }

                const setorGestor =
                    obterSetor(colaboradorGestor)
                        .trim()
                        .toLowerCase();

                return (
                    setorGestor ===
                    setorColaborador
                );
            })
            .map(usuario =>
                colaboradorDoUsuario(usuario)
            )
            .filter(Boolean);

    return gestoresDoMesmoSetor.length === 1
        ? gestoresDoMesmoSetor[0]
        : null;
}

export default buscarGestorColaborador;