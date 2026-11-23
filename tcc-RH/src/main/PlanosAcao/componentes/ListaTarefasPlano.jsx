import CardTarefaPlano from './CardTarefaPlano.jsx';

import './css-componentes/listaTarefasPlano.css';

function ListaTarefasPlano({
    tarefas,
    tituloTarefa,
    setTituloTarefa,
    descricaoTarefa,
    setDescricaoTarefa,
    adicionarTarefa,
    removerTarefa,
    moverTarefa,
    desabilitado
}) {
    return (
        <section className="secao-acoes-operacionais">

            {/* CABEÇALHO */}

            <div className="cabecalho-acoes-operacionais">

                <div className="titulo-acoes-operacionais">

                    <span className="icone-acoes-operacionais">
                        <i className="fa-solid fa-list-check"></i>
                    </span>

                    <div>
                        <h2>
                            Defina as ações operacionais e práticas
                            <br />
                            do plano
                        </h2>

                        <p>
                            Adicione as ações necessárias para mitigar
                            o fator identificado. Defina responsáveis
                            operacionais, prazos rigorosos e ordene
                            a sequência de implementação.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="botao-adicionar-acao"
                    onClick={adicionarTarefa}
                    disabled={
                        !tituloTarefa.trim() ||
                        !descricaoTarefa.trim() ||
                        desabilitado
                    }
                >
                    <span>⊕</span>
                    Adicionar Nova Ação
                </button>

            </div>


            {/* CAMPOS PARA NOVA AÇÃO */}

            <div className="formulario-nova-acao">

                <input
                    type="text"
                    value={tituloTarefa}
                    onChange={(evento) =>
                        setTituloTarefa(evento.target.value)
                    }
                    placeholder="Título da ação"
                    maxLength={150}
                    disabled={desabilitado}
                />

                <textarea
                    value={descricaoTarefa}
                    onChange={(evento) =>
                        setDescricaoTarefa(evento.target.value)
                    }
                    placeholder="Descrição detalhada da ação"
                    rows={2}
                    disabled={desabilitado}
                />

            </div>


            {/* LISTA DE AÇÕES */}

            <div className="lista-acoes-operacionais">

                {tarefas.length > 0 ? (

                    tarefas.map((tarefa, indice) => (

                        <CardTarefaPlano
                            key={tarefa.id}
                            tarefa={tarefa}
                            indice={indice}
                            total={tarefas.length}
                            removerTarefa={removerTarefa}
                            moverTarefa={moverTarefa}
                            desabilitado={desabilitado}
                        />

                    ))

                ) : (

                    <div className="acoes-vazias-plano">
                        Nenhuma ação adicionada. Preencha o título
                        e a descrição acima para adicionar uma ação.
                    </div>

                )}

            </div>

        </section>
    );
}

export default ListaTarefasPlano;