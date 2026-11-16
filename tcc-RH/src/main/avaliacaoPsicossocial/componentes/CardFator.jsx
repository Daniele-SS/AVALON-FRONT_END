
import './css-componentes/cardFator.css';

//----------------- CARD DE FATOR ----------------------------//

function CardFator({
    fator,
    selecionado,
    onChange
}) {

    return (

        <label className={`card-fator-avaliacao ${selecionado ? 'fator-selecionado' : ''}`}>

            <input
                type="checkbox"
                checked={selecionado}
                onChange={() => onChange(fator.id)}
            />

            <div className="informacoes-fator-avaliacao">

                <h3>{fator.nome}</h3>

                {fator.descricao && (
                    <p>{fator.descricao}</p>
                )}

            </div>

        </label>

    );

}

export default CardFator;
