
//----------------- LOCALIZAR REGISTRO -----------------------------//

export function localizarPorId(lista = [], id) {
    if (id === undefined || id === null || id === '') {
        return 'Não informado';
    }

    const registro = lista.find((item) => (
        String(
            item.id ??
            item.id_cargo ??
            item.id_setor ??
            item.id_nivel_acesso ??
            item.id_jornada_escala
        ) === String(id)
    ));

    if (!registro) {
        return 'Não informado';
    }

    return (
        registro.nome ||
        registro.nome_cargo ||
        registro.nome_setor ||
        registro.nome_colaborador ||
        registro.nome_completo ||
        registro.descricao ||
        'Não informado'
    );
}

//----------------- DATA ATUAL -------------------------------------//

export function obterDataAtual() {
    const data = new Date();

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

//----------------- FORMATAR DATA ----------------------------------//

export function formatarData(data) {
    if (!data) {
        return 'Não informado';
    }

    const dataTexto = String(data).split('T')[0];

    if (dataTexto.includes('-')) {
        const partes = dataTexto.split('-');

        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }

    return data;
}

//----------------- FORMATAR CPF -----------------------------------//

export function formatarCpf(cpf) {
    if (!cpf) {
        return 'Não informado';
    }

    const numeros = String(cpf).replace(/\D/g, '');

    if (numeros.length !== 11) {
        return cpf;
    }

    return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
    );
}

//----------------- FORMATAR TELEFONE ------------------------------//

export function formatarTelefone(telefone) {
    if (!telefone) {
        return 'Não informado';
    }

    const numeros = String(telefone).replace(/\D/g, '');

    if (numeros.length === 11) {
        return numeros.replace(
            /(\d{2})(\d{5})(\d{4})/,
            '($1) $2-$3'
        );
    }

    if (numeros.length === 10) {
        return numeros.replace(
            /(\d{2})(\d{4})(\d{4})/,
            '($1) $2-$3'
        );
    }

    return telefone;
}

//----------------- NORMALIZAR STATUS -------------------------------//

export function colaboradorEstaAtivo(colaborador) {
    const status = String(colaborador?.status ?? '')
        .trim()
        .toLowerCase();

    return (
        status === 'ativo' ||
        status === '1' ||
        status === 'true'
    );
}

export function nivelEstaAtivo(nivel) {
    const status = String(nivel?.status ?? '')
        .trim()
        .toLowerCase();

    return (
        status === 'ativo' ||
        status === '1' ||
        status === 'true'
    );
}

//----------------- OBTER ID DO SETOR -------------------------------//

export function obterIdSetor(colaborador) {
    return (
        colaborador?.id_setor ??
        colaborador?.setor?.[0]?.id ??
        colaborador?.setor?.id ??
        colaborador?.setor?.[0]?.id_setor ??
        null
    );
}
