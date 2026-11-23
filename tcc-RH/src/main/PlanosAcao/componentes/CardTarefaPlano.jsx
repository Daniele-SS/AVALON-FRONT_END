import './css-componentes/cardTarefaPlano.css';

function CardTarefaPlano({
    tarefa,
    indice,
    total,
    removerTarefa,
    moverTarefa,
    desabilitado
}) {
    return (
        <article className="card-acao-operacional">

            {/* IDENTIFICAÇÃO E TEXTO */}

            <div className="conteudo-card-acao">

                <span className="marcador-acao">
                    ⠿
                </span>

                <div className="texto-card-acao">

                    <h3>
                        {indice + 1}. {tarefa.titulo}
                    </h3>

                    <p>
                        {tarefa.descricao}
                    </p>

                </div>

            </div>


            {/* CONTROLES */}

            <div className="controles-card-acao">

                <button
                    type="button"
                    onClick={() => moverTarefa(indice, -1)}
                    disabled={desabilitado || indice === 0}
                    title="Mover ação para cima"
                >
                    <i className="fa-solid fa-chevron-up"></i>
                </button>

                <button
                    type="button"
                    onClick={() => moverTarefa(indice, 1)}
                    disabled={
                        desabilitado ||
                        indice === total - 1
                    }
                    title="Mover ação para baixo"
                >
                    <i className="fa-solid fa-chevron-down"></i>
                </button>

                <button
                    type="button"
                    className="botao-remover-acao"
                    onClick={() => removerTarefa(tarefa.id)}
                    disabled={desabilitado}
                    title="Remover ação"
                >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>

            </div>

        </article>
    );
}

export default CardTarefaPlano;