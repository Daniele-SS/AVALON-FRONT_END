
 //----------------- IMPORTAÇÕES -----------------------------//

import './css-componentes/cardPesquisa.css';

import pesquisasIcon from '../img/pesquisas-icon.svg';
import participantesIcon from '../img/participantes-icon.svg';
import ampulhetaIcon from '../img/ampulheta-icon.svg';

import {
    interpretarSituacaoPesquisa
} from '../funcoes/pesquisa/montarInformacoesPesquisas.js';


//----------------- FORMATAR DATA --------------------------//

function formatarData(data) {

    if (!data) {
        return '--/--/----';
    }

    return new Date(data).toLocaleDateString('pt-BR', {
        timeZone: 'UTC'
    });

}


//----------------- INTERPRETAR PÚBLICO --------------------//

function interpretarPublico(pesquisa, pesquisaSetores, pesquisaCargos) {

    const tipoPublico = pesquisa.publico_selecionado;

    if (tipoPublico === 'TODOS') {
        return 'Todos os colaboradores';
    }

    if (tipoPublico === 'SETOR') {

        const setores = pesquisaSetores
            .filter(item =>
                Number(item.id_pesquisa ?? item.pesquisa?.id) ===
                Number(pesquisa.id)
            )
            .flatMap(item => {

                if (Array.isArray(item.setor)) {
                    return item.setor;
                }

                if (item.setor) {
                    return [item.setor];
                }

                return [];

            });

        const nomesSetores = [
            ...new Set(setores.map(setor => setor.nome).filter(Boolean))
        ];

        return nomesSetores.length > 0
            ? nomesSetores.join(', ')
            : 'Setores selecionados';

    }

    if (tipoPublico === 'CARGO') {

        const cargos = pesquisaCargos
            .filter(item =>
                Number(item.pesquisa?.id ?? item.id_pesquisa) ===
                Number(pesquisa.id)
            )
            .map(item => item.cargo?.nome)
            .filter(Boolean);

        const nomesCargos = [...new Set(cargos)];

        return nomesCargos.length > 0
            ? nomesCargos.join(', ')
            : 'Cargos selecionados';

    }

    return 'Público não informado';

}


//----------------- VERIFICAR COLABORADOR ATIVO -------------//

function colaboradorEstaAtivo(colaborador) {

    return String(colaborador.status).toLowerCase() === 'ativo';

}


//----------------- BUSCAR SETORES VINCULADOS ---------------//

function buscarIdsSetoresPesquisa(pesquisa, pesquisaSetores) {

    const vinculos = pesquisaSetores.filter(item =>

        Number(item.id_pesquisa ?? item.pesquisa?.id) ===
        Number(pesquisa.id)

    );

    const idsSetores = vinculos.flatMap(item => {

        if (Array.isArray(item.setor)) {

            return item.setor.map(setor => Number(setor.id));

        }

        if (item.setor?.id) {

            return [Number(item.setor.id)];

        }

        if (item.id_setor) {

            return [Number(item.id_setor)];

        }

        return [];

    });

    return [...new Set(idsSetores)];

}


//----------------- BUSCAR CARGOS VINCULADOS ----------------//

function buscarIdsCargosPesquisa(pesquisa, pesquisaCargos) {

    const vinculos = pesquisaCargos.filter(item =>

        Number(item.pesquisa?.id ?? item.id_pesquisa) ===
        Number(pesquisa.id)

    );

    const idsCargos = vinculos.map(item => {

        return Number(
            item.cargo?.id ??
            item.id_cargo
        );

    }).filter(id => Number.isFinite(id) && id > 0);

    return [...new Set(idsCargos)];

}


//----------------- CONTAR PÚBLICO ELEGÍVEL ----------------//

function contarPublicoElegivel(
    pesquisa,
    pesquisaSetores,
    pesquisaCargos,
    colaboradores
) {

    const tipoPublico = pesquisa.publico_selecionado;

    // Considera somente colaboradores ativos.
    const colaboradoresAtivos = colaboradores.filter(
        colaboradorEstaAtivo
    );


    // TODOS: todos os colaboradores ativos.
    if (tipoPublico === 'TODOS') {

        return colaboradoresAtivos.length;

    }


    // SETOR: colaboradores ativos dos setores vinculados.
    if (tipoPublico === 'SETOR') {

        const idsSetores = buscarIdsSetoresPesquisa(
            pesquisa,
            pesquisaSetores
        );

        if (idsSetores.length === 0) {
            return 0;
        }

        return colaboradoresAtivos.filter(colaborador => {

            const setoresColaborador = Array.isArray(colaborador.setor)
                ? colaborador.setor
                : colaborador.setor
                    ? [colaborador.setor]
                    : [];

            return setoresColaborador.some(setor =>

                idsSetores.includes(Number(setor.id))

            );

        }).length;

    }


    // CARGO: colaboradores ativos dos cargos vinculados.
    if (tipoPublico === 'CARGO') {

        const idsCargos = buscarIdsCargosPesquisa(
            pesquisa,
            pesquisaCargos
        );

        if (idsCargos.length === 0) {
            return 0;
        }

        return colaboradoresAtivos.filter(colaborador => {

            const idCargo = Number(
                colaborador.cargo?.id ??
                colaborador.id_cargo
            );

            return idsCargos.includes(idCargo);

        }).length;

    }

    return 0;

}


//----------------- IDENTIFICAR PARTICIPAÇÃO CONCLUÍDA ------//

function participacaoEstaConcluida(participacao) {

    const status = participacao.status;

    if (Number(status) === 1) {
        return true;
    }

    const statusTexto = String(status).toLowerCase();

    return [
        'concluída',
        'concluida',
        'encerrada',
        'finalizada',
        'finalizado'
    ].includes(statusTexto);

}


//----------------- IDENTIFICAR COLABORADOR DA PARTICIPAÇÃO -//

function identificarColaboradorParticipacao(participacao) {

    return (
        participacao.colaborador?.id ??
        participacao.id_colaborador ??
        participacao.colaborador_id ??
        participacao.usuario?.id ??
        participacao.id_usuario ??
        participacao.id
    );

}


//----------------- CONTAR RESPOSTAS CONCLUÍDAS -------------//

function contarParticipantesConcluidos(participacoesPesquisa) {

    const participacoesConcluidas = participacoesPesquisa.filter(
        participacaoEstaConcluida
    );

    const colaboradoresConcluidos = new Set();

    participacoesConcluidas.forEach((participacao, indice) => {

        const idColaborador = identificarColaboradorParticipacao(
            participacao
        );

        // Evita contar duas vezes o mesmo colaborador.
        // Se a API não retornar o identificador do colaborador,
        // utiliza o índice da participação como identificação.
        const identificador = idColaborador != null
            ? String(idColaborador)
            : `participacao-${indice}`;

        colaboradoresConcluidos.add(identificador);

    });

    return colaboradoresConcluidos.size;

}


//----------------- CARD PESQUISA --------------------------//

function CardPesquisa({
    pesquisa,
    participacoes = [],
    pesquisaSetores = [],
    pesquisaCargos = [],
    colaboradores = [],
    onVerAcompanhamento
}) {

    const situacao = interpretarSituacaoPesquisa(pesquisa);


    //----------------- PARTICIPAÇÕES DA PESQUISA ----------//

    const participacoesPesquisa = participacoes.filter(
        participacao =>

            Number(
                participacao.pesquisa?.id ??
                participacao.id_pesquisa
            ) === Number(pesquisa.id)

    );


    //----------------- TOTAL DO PÚBLICO -------------------//

    const totalParticipantes = contarPublicoElegivel(
        pesquisa,
        pesquisaSetores,
        pesquisaCargos,
        colaboradores
    );


    //----------------- RESPOSTAS CONCLUÍDAS ---------------//

    const participantesConcluidos = contarParticipantesConcluidos(
        participacoesPesquisa
    );


    //----------------- PORCENTAGEM DE PARTICIPAÇÃO ---------//

    const percentualParticipacao = totalParticipantes > 0
        ? Math.min(
            100,
            Math.round(
                (participantesConcluidos / totalParticipantes) * 100
            )
        )
        : 0;


    //----------------- PÚBLICO ----------------------------//

    const publico = interpretarPublico(
        pesquisa,
        pesquisaSetores,
        pesquisaCargos
    );


    //----------------- RENDERIZAR CARD --------------------//

    return (

        <article className="card-pesquisa">


            {/* CABEÇALHO DO CARD */}

            <div className="cabecalho-card-pesquisa">

                <div className="icone-card-pesquisa">

                    <img
                        src={pesquisasIcon}
                        alt="Pesquisa"
                    />

                </div>

                <span
                    className={`status-pesquisa status-${situacao
                        .toLowerCase()
                        .replaceAll(' ', '-')}`}
                >
                    {situacao}
                </span>

            </div>


            {/* INFORMAÇÕES DA PESQUISA */}

            <div className="informacoes-card-pesquisa">

                <h3>{pesquisa.titulo}</h3>

                <p className="descricao-card-pesquisa">

                    {pesquisa.descricao || 'Sem descrição informada.'}

                </p>

            </div>


            {/* PÚBLICO SELECIONADO */}

            <div className="publico-card-pesquisa">

                <span className="titulo-informacao-pesquisa">
                    Público-alvo
                </span>

                <p>{publico}</p>

            </div>


            {/* PERÍODO */}

            <div className="periodo-card-pesquisa">

                <img
                    src={ampulhetaIcon}
                    alt=""
                />

                <span>

                    {formatarData(pesquisa.data_inicio)}

                    {' até '}

                    {formatarData(pesquisa.data_fim)}

                </span>

            </div>


            {/* PARTICIPAÇÃO */}

            <div className="participacao-card-pesquisa">

                <div className="cabecalho-participacao-pesquisa">

                    <div className="titulo-participacao-pesquisa">

                        <img
                            src={participantesIcon}
                            alt=""
                        />

                        <span>Participação</span>

                    </div>

                    <strong>{percentualParticipacao}%</strong>

                </div>


                {/* BARRA DE PROGRESSO */}

                <div className="barra-participacao-pesquisa">

                    <div
                        className="progresso-participacao-pesquisa"
                        style={{
                            width: `${percentualParticipacao}%`
                        }}
                    />

                </div>


                {/* QUANTIDADE DE RESPOSTAS */}

                <span className="texto-participacao-pesquisa">

                    {participantesConcluidos} de {totalParticipantes}{' '}
                    participantes responderam

                </span>

            </div>


            {/* RODAPÉ: ANONIMATO E ACOMPANHAMENTO */}

            <div className="rodape-card-pesquisa">

                <span className="texto-anonimato-pesquisa">

                    {Number(pesquisa.anonimo) === 1
                        ? 'Pesquisa anônima'
                        : 'Pesquisa identificada'
                    }

                </span>

                <button
                    type="button"
                    className="botao-acompanhamento-pesquisa"
                    onClick={onVerAcompanhamento}
                >

                    Ver acompanhamento

                    <span aria-hidden="true">→</span>

                </button>

            </div>

        </article>

    );

}

export default CardPesquisa;
