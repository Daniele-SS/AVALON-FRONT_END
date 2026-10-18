
//----------------- NORMALIZAR NOME DO DIA --------------------------//

export function normalizarNomeDia(valor) {
    if (valor === undefined || valor === null) {
        return '';
    }

    const nome = String(valor)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/-feira/g, '');

    const dias = {
        segunda: 'segunda',
        seg: 'segunda',
        monday: 'segunda',

        terca: 'terca',
        ter: 'terca',
        tuesday: 'terca',

        quarta: 'quarta',
        qua: 'quarta',
        wednesday: 'quarta',

        quinta: 'quinta',
        qui: 'quinta',
        thursday: 'quinta',

        sexta: 'sexta',
        sex: 'sexta',
        friday: 'sexta',

        sabado: 'sabado',
        sab: 'sabado',
        saturday: 'sabado',

        domingo: 'domingo',
        dom: 'domingo',
        sunday: 'domingo'
    };

    if (dias[nome]) {
        return dias[nome];
    }

    const diasNumericos = {
        0: 'domingo',
        1: 'segunda',
        2: 'terca',
        3: 'quarta',
        4: 'quinta',
        5: 'sexta',
        6: 'sabado',
        7: 'domingo'
    };

    if (String(valor).trim() !== '' && Number.isInteger(Number(valor))) {
        return diasNumericos[Number(valor)] || '';
    }

    return '';
}

//----------------- DIAS DA SEMANA ----------------------------------//

export const DIAS_DA_SEMANA = [
    { chave: 'segunda', sigla: 'SEG', nome: 'Segunda-feira' },
    { chave: 'terca', sigla: 'TER', nome: 'Terça-feira' },
    { chave: 'quarta', sigla: 'QUA', nome: 'Quarta-feira' },
    { chave: 'quinta', sigla: 'QUI', nome: 'Quinta-feira' },
    { chave: 'sexta', sigla: 'SEX', nome: 'Sexta-feira' },
    { chave: 'sabado', sigla: 'SÁB', nome: 'Sábado' },
    { chave: 'domingo', sigla: 'DOM', nome: 'Domingo' }
];

//----------------- OBTER JORNADAS VINCULADAS AO DIA ----------------//

function obterJornadasDoDia(registro) {
    const relacao = registro?.jornada_escala?.jornadaEscala;

    if (Array.isArray(relacao)) {
        return relacao;
    }

    if (relacao && typeof relacao === 'object') {
        return [relacao];
    }

    return [];
}

//----------------- VERIFICAR JORNADA DO DIA ------------------------//

export function diaPertenceAJornada(registro, idJornada) {
    if (idJornada === undefined || idJornada === null || idJornada === '') {
        return false;
    }

    const jornadasVinculadas = obterJornadasDoDia(registro);

    const jornadaEncontrada = jornadasVinculadas.some((jornada) => (
        String(jornada.id ?? jornada.id_jornada_escala) === String(idJornada)
    ));

    if (jornadaEncontrada) {
        return true;
    }

    const idDireto =
        registro?.id_jornada_escala ??
        registro?.idJornadaEscala;

    return (
        idDireto !== undefined &&
        idDireto !== null &&
        String(idDireto) === String(idJornada)
    );
}

//----------------- OBTER DIA DO REGISTRO ---------------------------//

export function obterChaveDia(registro) {
    if (typeof registro === 'string' || typeof registro === 'number') {
        return normalizarNomeDia(registro);
    }

    if (!registro || typeof registro !== 'object') {
        return '';
    }

    return normalizarNomeDia(
        registro.dia_sigla ??
        registro.dia_semana_nome ??
        registro.nome_dia ??
        registro.dia_semana ??
        registro.diaSemana ??
        registro.nome ??
        registro.dia ??
        registro.id_dia_semana ??
        registro.idDiaSemana
    );
}

//----------------- STATUS DO DIA -----------------------------------//

export function obterStatusDia(registro) {
    if (!registro) {
        return 'Não configurado';
    }

    const valor = registro.ativo;

    if (valor !== undefined && valor !== null) {
        const status = String(valor).trim().toLowerCase();

        if (
            valor === 1 ||
            valor === true ||
            status === '1' ||
            status === 'true' ||
            status === 'ativo'
        ) {
            return 'Ativo';
        }

        if (
            valor === 0 ||
            valor === false ||
            status === '0' ||
            status === 'false' ||
            status === 'inativo'
        ) {
            return 'Folga';
        }
    }

    const status = String(registro.status ?? registro.status_dia ?? '')
        .trim()
        .toLowerCase();

    if (['ativo', 'trabalho', 'true', '1'].includes(status)) {
        return 'Ativo';
    }

    if (['inativo', 'folga', 'false', '0'].includes(status)) {
        return 'Folga';
    }

    return 'Não configurado';
}
