
import './css-componentes/cardPergunta.css';

//----------------- CARD DE PERGUNTA -------------------------//

function CardPergunta({ pergunta, numero }) {

    const escala = [
        { valor: 1, texto: 'Muito ruim' },
        { valor: 2, texto: 'Ruim' },
        { valor: 3, texto: 'Regular' },
        { valor: 4, texto: 'Bom' },
        { valor: 5, texto: 'Muito bom' }
    ];

    return (

        <article className="card-pergunta-avaliacao">

            {/* IDENTIFICAÇÃO DA PERGUNTA */}

            <div className="identificacao-pergunta-avaliacao">

                <div className="identificacao-pergunta-esquerda">

                    <span className="numero-pergunta-avaliacao">
                        Pergunta {numero}
                    </span>

                    <span className="fator-pergunta-avaliacao">
                        Fator: {pergunta.psicossocial_fator?.nome}
                    </span>

                </div>

                {Number(pergunta.obrigatorio) === 1 && (
                    <span className="pergunta-obrigatoria-avaliacao">
                        *Obrigatória
                    </span>
                )}

            </div>


            {/* ENUNCIADO */}

            <p className="texto-pergunta-avaliacao">
                {pergunta.enunciado}
            </p>


            {/* ESCALA DE RESPOSTAS */}

            <div className="escala-pergunta-avaliacao">

                {escala.map(item => (

                    <div
                        key={item.valor}
                        className="opcao-escala-pergunta"
                    >

                        <strong>{item.valor}</strong>

                        <span>{item.texto}</span>

                    </div>

                ))}

            </div>

        </article>

    );

}

export default CardPergunta;
