import { useEffect } from 'react';

import './css-planoAcao/acompanhamentoPlanoAcao.css';


//----------------- INTERPRETAR TAREFA ---------------------//

function interpretarTarefa(tarefa) {

    const descricaoOriginal = tarefa?.descricao;

    // A API pode retornar os dados da tarefa como JSON
    // dentro do campo descricao.
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
            // Se não for JSON, trata como texto simples.
        }

    }

    // Compatibilidade com tarefas antigas.
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

function AcompanhamentoPlanoAcao({ plano, onFechar }) {

    //----------------- TAREFAS ------------------------------//

    const tarefas = Array.isArray(plano?.tarefasPlano)
        ? [...plano.tarefasPlano].sort(
            (a, b) => Number(a.ordem) - Number(b.ordem)
        )
        : [];

    const totalTarefas = tarefas.length;

    const tarefasConcluidas = tarefas.filter(
        (tarefa) => Number(tarefa.status) === 1
    ).length;

    const progresso = totalTarefas > 0
        ? Math.round(
            (tarefasConcluidas / totalTarefas) * 100
        )
        : 0;


    //----------------- FECHAR COM ESC ----------------------//

    useEffect(() => {

        function fecharComEsc(evento) {

            if (evento.key === 'Escape') {
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

    }, [onFechar]);


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

                                    return (

                                        <article
                                            className={`tarefa-modal-plano ${
                                                concluida
                                                    ? 'tarefa-modal-concluida'
                                                    : ''
                                            }`}
                                            key={tarefa.id ?? indice}
                                        >

                                            <div className="numero-tarefa-modal">
                                                {indice + 1}
                                            </div>

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

                    {/* Botão visual por enquanto, sem ação. */}

                    <button
                        type="button"
                        className="botao-encerrar-modal-acompanhamento"
                    >
                        Encerrar
                    </button>

                </footer>

            </section>

        </div>

    );

}


//----------------- EXPORTAÇÃO -----------------------------//

export default AcompanhamentoPlanoAcao;