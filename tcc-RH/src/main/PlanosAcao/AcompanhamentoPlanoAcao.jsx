
import { useEffect, useState } from 'react';

import {
    atualizarTarefaPlano
} from './servicos/tarefasPlanoApi.js';

import {
    encerrarPlanoAcao
} from './servicos/planosAcaoApi.js';

import './css-planoAcao/acompanhamentoPlanoAcao.css';


//----------------- INTERPRETAR TAREFA ---------------------//

function interpretarTarefa(tarefa) {

    const descricaoOriginal = tarefa?.descricao;

    if (typeof descricaoOriginal === 'string') {

        try {

            const dadosTarefa = JSON.parse(descricaoOriginal);

            if (
                dadosTarefa &&
                typeof dadosTarefa === 'object'
            ) {

                return {
                    titulo:
                        dadosTarefa.titulo ||
                        tarefa?.titulo ||
                        'Tarefa',

                    descricao:
                        dadosTarefa.descricao ||
                        ''
                };

            }

        } catch {
            // A descrição pode ser um texto simples.
        }

    }

    return {
        titulo:
            tarefa?.titulo ||
            descricaoOriginal ||
            'Tarefa',

        descricao:
            tarefa?.titulo
                ? descricaoOriginal || ''
                : ''
    };

}


//----------------- COMPONENTE -----------------------------//

function AcompanhamentoPlanoAcao({
    plano,
    onFechar,
    perfil = 'RH',
    onPlanoAtualizado
}) {

    const [tarefas, setTarefas] = useState([]);

    const [carregandoTarefa, setCarregandoTarefa] = useState(null);

    const [encerrando, setEncerrando] = useState(false);

    const [confirmarEncerramento, setConfirmarEncerramento] = useState(false);

    const [erro, setErro] = useState('');

    const [planoEncerrado, setPlanoEncerrado] = useState(
        Number(plano?.status) === 1
    );


    //----------------- CARREGAR TAREFAS --------------------//

    useEffect(() => {

        const tarefasPlano = Array.isArray(plano?.tarefasPlano)
            ? [...plano.tarefasPlano].sort(
                (a, b) => Number(a.ordem) - Number(b.ordem)
            )
            : [];

        setTarefas(tarefasPlano);

        setPlanoEncerrado(Number(plano?.status) === 1);

        setConfirmarEncerramento(false);

        setErro('');

    }, [plano]);


    //----------------- PROGRESSO ----------------------------//

    const totalTarefas = tarefas.length;

    const tarefasConcluidas = tarefas.filter(
        (tarefa) => Number(tarefa.status) === 1
    ).length;

    const progresso = totalTarefas > 0
        ? Math.round(
            (tarefasConcluidas / totalTarefas) * 100
        )
        : 0;

    const todasTarefasConcluidas =
        totalTarefas > 0 &&
        tarefasConcluidas === totalTarefas;


    //----------------- PERMISSÕES DA TELA ------------------//

    const usuarioEhGestor = perfil === 'Gestor';

    const podeAlterarTarefas =
        usuarioEhGestor &&
        !planoEncerrado;


    //----------------- ATUALIZAR TAREFA --------------------//

    async function alterarStatusTarefa(tarefa) {

        if (
            !podeAlterarTarefas ||
            carregandoTarefa !== null
        ) {
            return;
        }

        if (!tarefa?.id) {

            setErro(
                'Não foi possível identificar a tarefa para atualização.'
            );

            return;

        }

        const novoStatus =
            Number(tarefa.status) === 1 ? 0 : 1;

        const tarefaAtualizada = {
            ...tarefa,
            status: novoStatus
        };

        try {

            setErro('');
            setCarregandoTarefa(tarefa.id);

            await atualizarTarefaPlano(
                tarefa.id,
                tarefaAtualizada
            );

            const tarefasAtualizadas = tarefas.map((item) =>
                String(item.id) === String(tarefa.id)
                    ? tarefaAtualizada
                    : item
            );

            setTarefas(tarefasAtualizadas);

            if (onPlanoAtualizado) {
                onPlanoAtualizado({
                    ...plano,
                    tarefasPlano: tarefasAtualizadas
                });
            }

        } catch (error) {

            setErro(
                error.message ||
                'Não foi possível atualizar a tarefa.'
            );

        } finally {

            setCarregandoTarefa(null);

        }

    }


    //----------------- ABRIR CONFIRMAÇÃO -------------------//

    function abrirConfirmacaoEncerramento() {

        if (
            planoEncerrado ||
            encerrando ||
            (
                usuarioEhGestor &&
                !todasTarefasConcluidas
            )
        ) {
            return;
        }

        setErro('');
        setConfirmarEncerramento(true);

    }


    //----------------- CANCELAR CONFIRMAÇÃO ----------------//

    function cancelarEncerramento() {

        if (encerrando) {
            return;
        }

        setConfirmarEncerramento(false);

    }


    //----------------- CONFIRMAR ENCERRAMENTO --------------//

    async function confirmarEncerramentoPlano() {

        if (planoEncerrado || encerrando) {
            return;
        }

        // O Gestor só pode encerrar quando todas
        // as tarefas estiverem concluídas.
        if (
            usuarioEhGestor &&
            !todasTarefasConcluidas
        ) {
            setConfirmarEncerramento(false);
            return;
        }

        try {

            setErro('');
            setEncerrando(true);

            await encerrarPlanoAcao(plano.id);

            setPlanoEncerrado(true);
            setConfirmarEncerramento(false);

            if (onPlanoAtualizado) {
                onPlanoAtualizado({
                    ...plano,
                    status: 1,
                    tarefasPlano: tarefas
                });
            }

            onFechar();

        } catch (error) {

            setErro(
                error.message ||
                'Não foi possível encerrar o plano.'
            );

        } finally {

            setEncerrando(false);

        }

    }


    //----------------- FECHAR COM ESC ----------------------//

    useEffect(() => {

        function fecharComEsc(evento) {

            if (evento.key === 'Escape') {

                if (confirmarEncerramento) {
                    cancelarEncerramento();
                    return;
                }

                onFechar();

            }

        }

        document.addEventListener('keydown', fecharComEsc);

        return () => {
            document.removeEventListener(
                'keydown',
                fecharComEsc
            );
        };

    }, [onFechar, confirmarEncerramento, encerrando]);


    //----------------- MODAL -------------------------------//

    return (

        <div
            className="fundo-acompanhamento-plano"
            onClick={onFechar}
        >

            <section
                className="janela-acompanhamento-plano"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-acompanhamento-plano"
                onClick={(evento) => evento.stopPropagation()}
            >

                {/* CABEÇALHO */}

                <header className="cabecalho-modal-acompanhamento">

                    <div className="texto-cabecalho-modal-acompanhamento">

                        <span className="subtitulo-modal-acompanhamento">
                            ACOMPANHAMENTO
                        </span>

                        <h1 id="titulo-acompanhamento-plano">
                            {plano?.titulo || 'Plano de Ação'}
                        </h1>

                        <p>
                            Acompanhe o progresso e as tarefas deste plano.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="botao-fechar-modal-acompanhamento"
                        onClick={onFechar}
                        aria-label="Fechar acompanhamento"
                    >
                        ×
                    </button>

                </header>


                {/* CONTEÚDO */}

                <div className="conteudo-modal-acompanhamento">

                    {/* PROGRESSO */}

                    <section className="progresso-acompanhamento-plano">

                        <div className="informacoes-progresso-modal">

                            <div>
                                <h2>Progresso do plano</h2>

                                <p>
                                    {tarefasConcluidas} de {totalTarefas} tarefas concluídas
                                </p>
                            </div>

                            <span className="porcentagem-progresso-modal">
                                {progresso}%
                            </span>

                        </div>

                        <div
                            className="barra-progresso-modal"
                            role="progressbar"
                            aria-label="Progresso do plano de ação"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progresso}
                        >

                            <div
                                className="preenchimento-progresso-modal"
                                style={{
                                    width: `${progresso}%`
                                }}
                            />

                        </div>

                    </section>


                    {/* SITUAÇÃO DO PLANO */}

                    {planoEncerrado && (

                        <div className="aviso-plano-encerrado-modal">
                            Este plano de ação foi encerrado. As tarefas estão disponíveis somente para consulta.
                        </div>

                    )}


                    {/* MENSAGEM DE ERRO */}

                    {erro && (

                        <div className="erro-acompanhamento-modal">
                            {erro}
                        </div>

                    )}


                    {/* TAREFAS */}

                    <section className="tarefas-acompanhamento-plano">

                        <div className="titulo-tarefas-modal">

                            <h2>Tarefas</h2>

                            <span>
                                {totalTarefas}
                            </span>

                        </div>

                        {tarefas.length === 0 ? (

                            <div className="mensagem-sem-tarefas-modal">
                                Nenhuma tarefa cadastrada neste plano.
                            </div>

                        ) : (

                            <div className="lista-tarefas-modal">

                                {tarefas.map((tarefa, indice) => {

                                    const dadosTarefa =
                                        interpretarTarefa(tarefa);

                                    const concluida =
                                        Number(tarefa.status) === 1;

                                    const atualizando =
                                        carregandoTarefa !== null &&
                                        String(carregandoTarefa) === String(tarefa.id);

                                    return (

                                        <article
                                            className={`tarefa-modal-plano ${
                                                concluida
                                                    ? 'tarefa-modal-concluida'
                                                    : ''
                                            }`}
                                            key={tarefa.id ?? indice}
                                        >

                                            {podeAlterarTarefas ? (

                                                <button
                                                    type="button"
                                                    className={`botao-status-tarefa-modal ${
                                                        concluida
                                                            ? 'botao-status-tarefa-concluida'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        alterarStatusTarefa(tarefa)
                                                    }
                                                    disabled={
                                                        carregandoTarefa !== null ||
                                                        planoEncerrado
                                                    }
                                                    aria-label={
                                                        concluida
                                                            ? 'Marcar tarefa como em andamento'
                                                            : 'Marcar tarefa como concluída'
                                                    }
                                                >
                                                    {atualizando
                                                        ? '...'
                                                        : concluida
                                                            ? '✓'
                                                            : ''}
                                                </button>

                                            ) : (

                                                <div className="numero-tarefa-modal">
                                                    {indice + 1}
                                                </div>

                                            )}

                                            <div className="conteudo-tarefa-modal">

                                                <h3>
                                                    {dadosTarefa.titulo}
                                                </h3>

                                                {dadosTarefa.descricao && (

                                                    <p>
                                                        {dadosTarefa.descricao}
                                                    </p>

                                                )}

                                            </div>

                                            <span
                                                className={`status-tarefa-modal ${
                                                    concluida
                                                        ? 'status-modal-concluida'
                                                        : 'status-modal-andamento'
                                                }`}
                                            >
                                                {concluida
                                                    ? 'Concluída'
                                                    : 'Em andamento'}
                                            </span>

                                        </article>

                                    );

                                })}

                            </div>

                        )}

                    </section>

                </div>


                {/* RODAPÉ */}

                <footer className="rodape-modal-acompanhamento">

                    <button
                        type="button"
                        className="botao-voltar-modal-acompanhamento"
                        onClick={onFechar}
                    >
                        Voltar
                    </button>

                    <button
                        type="button"
                        className="botao-encerrar-modal-acompanhamento"
                        onClick={abrirConfirmacaoEncerramento}
                        disabled={
                            planoEncerrado ||
                            encerrando ||
                            (
                                usuarioEhGestor &&
                                !todasTarefasConcluidas
                            )
                        }
                    >
                        {planoEncerrado
                            ? 'Plano encerrado'
                            : 'Encerrar'}
                    </button>

                </footer>


                {/* MODAL DE CONFIRMAÇÃO DE ENCERRAMENTO */}

                {confirmarEncerramento && (

                    <div
                        className="fundo-confirmacao-encerramento"
                        onClick={cancelarEncerramento}
                    >

                        <section
                            className="janela-confirmacao-encerramento"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="titulo-confirmacao-encerramento"
                            aria-describedby="descricao-confirmacao-encerramento"
                            onClick={(evento) => evento.stopPropagation()}
                        >

                            <div className="icone-confirmacao-encerramento">
                                !
                            </div>

                            <h2 id="titulo-confirmacao-encerramento">
                                Encerrar Plano de Ação?
                            </h2>

                            <p id="descricao-confirmacao-encerramento">
                                Tem certeza de que deseja encerrar este plano de ação?
                                Após o encerramento, não será possível alterar o status
                                das tarefas.
                            </p>

                            <div className="botoes-confirmacao-encerramento">

                                <button
                                    type="button"
                                    className="botao-cancelar-confirmacao-encerramento"
                                    onClick={cancelarEncerramento}
                                    disabled={encerrando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="botao-confirmar-encerramento"
                                    onClick={confirmarEncerramentoPlano}
                                    disabled={encerrando}
                                >
                                    {encerrando
                                        ? 'Encerrando...'
                                        : 'Sim, encerrar'}
                                </button>

                            </div>

                        </section>

                    </div>

                )}

            </section>

        </div>

    );

}


//----------------- EXPORTAÇÃO -----------------------------//

export default AcompanhamentoPlanoAcao;
