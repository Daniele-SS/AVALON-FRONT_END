
import CardPergunta from './CardPergunta';

import './css-componentes/listaPerguntas.css';

//----------------- LISTA DE PERGUNTAS -----------------------//

function ListaPerguntas({ perguntas = [] }) {

    const perguntasOrdenadas = [...perguntas].sort(
        (a, b) => Number(a.ordem) - Number(b.ordem)
    );

    return (

        <div className="lista-perguntas-avaliacao">

            {perguntasOrdenadas.length === 0 ? (

                <p className="lista-perguntas-vazia">
                    Selecione um fator para visualizar suas perguntas.
                </p>

            ) : (

                <div className="itens-lista-perguntas">

                    {perguntasOrdenadas.map((pergunta, indice) => (

                        <CardPergunta
                            key={pergunta.id}
                            pergunta={pergunta}
                            numero={indice + 1}
                        />

                    ))}

                </div>

            )}

        </div>

    );

}

export default ListaPerguntas;
