
//----------------- IMPORTAÇÕES -----------------------------//

import Minicards from '../../componentes/minicard/minicard.jsx';

import CardResultadoPergunta from './componentes/CardResultadoPergunta.jsx';

import './css-pesquisas/acompanhamentoPesquisa.css';

import ConcluidoIcon from './img/concluido-icon.svg';
import PedenteIcon from './img/Pedente-icon.svg';
import CadastroIcon from './img/cadastro-icon.svg';


//----------------- IDENTIFICAR RESPOSTA CONCLUÍDA ---------//

function participacaoEstaConcluida(participacao) {

    if (Number(participacao.status) === 1) {
        return true;
    }

    const status = String(participacao.status).toLowerCase();

    return [
        'concluída',
        'concluida',
        'finalizada',
        'finalizado',
        'encerrada'
    ].includes(status);

}


//----------------- IDENTIFICAR PESQUISA ANÔNIMA -----------//

function pesquisaEhAnonima(pesquisa) {

    const anonimo = String(pesquisa?.anonimo).toLowerCase();

    return [
        '1',
        'true',
        'sim'
    ].includes(anonimo);

}


//----------------- BUSCAR SETORES VINCULADOS --------------//

function buscarIdsSetores(pesquisa, pesquisaSetores) {

    const vinculos = pesquisaSetores.filter(item =>
        Number(item.pesquisa?.id ?? item.id_pesquisa) ===
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


//----------------- BUSCAR CARGOS VINCULADOS ---------------//

function buscarIdsCargos(pesquisa, pesquisaCargos) {

    const vinculos = pesquisaCargos.filter(item =>
        Number(item.pesquisa?.id ?? item.id_pesquisa) ===
        Number(pesquisa.id)
    );

    const idsCargos = vinculos.map(item =>
        Number(item.cargo?.id ?? item.id_cargo)
    ).filter(id => Number.isFinite(id) && id > 0);

    return [...new Set(idsCargos)];

}


//----------------- CONTAR PÚBLICO PARTICIPANTE ------------//

function contarPublicoParticipante(
    pesquisa,
    pesquisaSetores,
    pesquisaCargos,
    colaboradores
) {

    const colaboradoresAtivos = colaboradores.filter(
        colaborador =>
            String(colaborador.status).toLowerCase() === 'ativo'
    );


    if (pesquisa.publico_selecionado === 'TODOS') {
        return colaboradoresAtivos.length;
    }


    if (pesquisa.publico_selecionado === 'SETOR') {

        const idsSetores = buscarIdsSetores(
            pesquisa,
            pesquisaSetores
        );

        return colaboradoresAtivos.filter(colaborador => {

            const setores = Array.isArray(colaborador.setor)
                ? colaborador.setor
                : colaborador.setor
                    ? [colaborador.setor]
                    : [];

            return setores.some(setor =>
                idsSetores.includes(Number(setor.id))
            );

        }).length;

    }


    if (pesquisa.publico_selecionado === 'CARGO') {

        const idsCargos = buscarIdsCargos(
            pesquisa,
            pesquisaCargos
        );

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


//----------------- CONTAR RESPOSTAS COLETADAS --------------//

function contarRespostasColetadas(pesquisa, participacoes) {

    const participacoesPesquisa = participacoes.filter(
        participacao =>
            Number(
                participacao.pesquisa?.id ??
                participacao.id_pesquisa
            ) === Number(pesquisa.id) &&
            participacaoEstaConcluida(participacao)
    );


    const colaboradoresConcluidos = new Set();

    participacoesPesquisa.forEach((participacao, indice) => {

        const idColaborador =
            participacao.colaborador?.id ??
            participacao.id_colaborador ??
            participacao.colaborador_id ??
            participacao.usuario?.id ??
            participacao.id_usuario ??
            participacao.id;

        const identificador = idColaborador != null
            ? String(idColaborador)
            : `participacao-${indice}`;

        colaboradoresConcluidos.add(identificador);

    });

    return colaboradoresConcluidos.size;

}


//----------------- BUSCAR ID DA PESQUISA DA PERGUNTA -------//

function buscarIdPesquisaPergunta(pergunta) {

    return Number(
        pergunta?.pesquisa?.id ??
        pergunta?.id_pesquisa
    );

}


//----------------- FILTRAR PERGUNTAS DA PESQUISA -----------//

function filtrarPerguntasPesquisa(pesquisa, perguntas) {

    return perguntas
        .filter(pergunta =>
            buscarIdPesquisaPergunta(pergunta) ===
            Number(pesquisa.id)
        )
        .sort((a, b) => Number(a.ordem) - Number(b.ordem));

}


//----------------- FILTRAR RESULTADOS DA PESQUISA ----------//

function filtrarResultadosPesquisa(pesquisa, pesquisaResultados) {

    return pesquisaResultados.filter(resultado => {

        const idPesquisaResultado = Number(
            resultado?.pesquisa?.id ??
            resultado?.id_pesquisa
        );

        const idPesquisaDaPergunta = Number(
            resultado?.pergunta?.pesquisa?.id ??
            resultado?.pergunta?.id_pesquisa
        );

        return idPesquisaResultado === Number(pesquisa.id) &&
            idPesquisaDaPergunta === Number(pesquisa.id);

    });

}


//----------------- IDENTIFICAR PARTICIPAÇÃO DA RESPOSTA -----//

function buscarIdParticipacaoResposta(resposta) {

    return Number(
        resposta?.id_participacao ??
        resposta?.participacao?.id
    );

}


//----------------- FILTRAR RESPOSTAS DA PESQUISA ------------//

function filtrarRespostasPesquisa(
    pesquisa,
    respostas,
    participacoes
) {

    const participacoesConcluidas = participacoes.filter(
        participacao =>
            Number(
                participacao.pesquisa?.id ??
                participacao.id_pesquisa
            ) === Number(pesquisa.id) &&
            participacaoEstaConcluida(participacao)
    );


    const idsParticipacoes = new Set(
        participacoesConcluidas.map(participacao =>
            Number(participacao.id ?? participacao.id_participacao)
        )
    );


    return respostas.filter(resposta => {

        const idParticipacao = buscarIdParticipacaoResposta(
            resposta
        );

        return idsParticipacoes.has(idParticipacao);

    });

}


//----------------- CONTAR RESPOSTAS VÁLIDAS DA PERGUNTA -----//

function contarRespostasValidasPergunta(
    pergunta,
    pesquisaResultados,
    respostas
) {

    const tipoPergunta = String(
        pergunta?.tipo || ''
    ).toLowerCase();


    if (tipoPergunta === 'alternativa') {

        return pesquisaResultados
            .filter(resultado =>
                Number(
                    resultado?.pergunta?.id ??
                    resultado?.id_pergunta
                ) === Number(pergunta.id)
            )
            .reduce((total, resultado) => {

                return total + Number(
                    resultado.quantidade_resposta || 0
                );

            }, 0);

    }


    if (tipoPergunta === 'discursiva') {

        return respostas.filter(resposta => {

            return Number(
                resposta.id_pergunta ??
                resposta.pergunta?.id
            ) === Number(pergunta.id) &&
                String(resposta.valor ?? '').trim() !== '';

        }).length;

    }

    return 0;

}


//----------------- TELA DE ACOMPANHAMENTO -----------------//

function AcompanhamentoPesquisa({
    pesquisa,
    participacoes = [],
    pesquisaSetores = [],
    pesquisaCargos = [],
    colaboradores = [],

    perguntas = [],
    respostas = [],
    pesquisaResultados = [],

    onVoltar
}) {


    //----------------- TOTAL DE PARTICIPANTES --------------//

    const totalParticipantes = contarPublicoParticipante(
        pesquisa,
        pesquisaSetores,
        pesquisaCargos,
        colaboradores
    );


    //----------------- RESPOSTAS COLETADAS -----------------//

    const totalRespostasColetadas = contarRespostasColetadas(
        pesquisa,
        participacoes
    );


    //----------------- RESPOSTAS PENDENTES -----------------//

    const totalPendente = Math.max(
        totalParticipantes - totalRespostasColetadas,
        0
    );


    //----------------- IDENTIFICAR ANONIMATO ---------------//

    const pesquisaAnonima = pesquisaEhAnonima(pesquisa);


    //----------------- PERGUNTAS DA PESQUISA ---------------//

    const perguntasPesquisa = filtrarPerguntasPesquisa(
        pesquisa,
        perguntas
    );


    //----------------- RESULTADOS DA PESQUISA --------------//

    const resultadosPesquisa = filtrarResultadosPesquisa(
        pesquisa,
        pesquisaResultados
    );


    //----------------- RESPOSTAS DA PESQUISA ---------------//

    const respostasConcluidas = filtrarRespostasPesquisa(
        pesquisa,
        respostas,
        participacoes
    );


    //----------------- RENDERIZAÇÃO ------------------------//

    return (

        <div className="pagina-acompanhamento-pesquisa">


            {/* CABEÇALHO */}

            <header className="cabecalho-acompanhamento-pesquisa">

                <nav className="caminho-acompanhamento-pesquisa">


                    <button
                        type="button"
                        onClick={onVoltar}
                    >
                        Pesquisas
                    </button>

                    <span className="seta-acompanhamento">
                        &gt;
                    </span>


                    <span className="pagina-atual-acompanhamento">
                        Acompanhamento
                    </span>

                </nav>


                <h1 className="nome-pesquisa-acompanhamento">
                    {pesquisa?.titulo || 'Pesquisa'}
                </h1>

            </header>


            {/* MINICARDS */}

            <div className="minicards-acompanhamento-pesquisa">

                <Minicards
                    icone={CadastroIcon}
                    numero={totalParticipantes}
                    informacao="Público participante"
                    corFundo="#EAF2FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={ConcluidoIcon}
                    numero={totalRespostasColetadas}
                    informacao="Respostas coletadas"
                    corFundo="#EAF2FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={PedenteIcon}
                    numero={totalPendente}
                    informacao="Faltam responder"
                    corFundo="#EAF2FF"
                    layout="horizontal"
                />

            </div>


            {/* RESULTADOS DAS PERGUNTAS */}

            <section className="resultados-acompanhamento-pesquisa">

                <h2 className="titulo-resultados-pesquisa">
                    Resultados por pergunta
                </h2>


                {perguntasPesquisa.length > 0 ? (

                    <div className="lista-resultados-perguntas">

                        {perguntasPesquisa.map(pergunta => {

                            const totalRespostasPergunta =
                                contarRespostasValidasPergunta(
                                    pergunta,
                                    resultadosPesquisa,
                                    respostasConcluidas
                                );


                            const mostrarResultados =
                                !pesquisaAnonima ||
                                totalRespostasPergunta >= 1;


                            return (
                                <CardResultadoPergunta
                                    key={pergunta.id}
                                    pergunta={pergunta}
                                    pesquisa={pesquisa}
                                    pesquisaResultados={resultadosPesquisa}
                                    respostas={respostasConcluidas}
                                    participacoes={participacoes}
                                    mostrarResultados={mostrarResultados}
                                />
                            );

                        })}

                    </div>

                ) : (

                    <div className="sem-perguntas-pesquisa">

                        <p>
                            Esta pesquisa ainda não possui perguntas.
                        </p>

                    </div>

                )}

            </section>
            {/* BOTÃO VOLTAR NO FINAL DA TELA */}

            <div className="rodape-acompanhamento-pesquisa">

                <button
                    type="button"
                    className="botao-voltar-acompanhamento"
                    onClick={onVoltar}
                >
                    ← Voltar para pesquisas
                </button>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default AcompanhamentoPesquisa;
