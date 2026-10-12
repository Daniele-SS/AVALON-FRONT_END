//----------------- IMPORTAÇÕES ----------------------------//

import '../cardNomePag/nomePag.css';
import iconeSinalMais from '../img/sinalMais-icon.svg';

//----------------- COMPONENTE -----------------------------//

function BotaoCadastro({
    titulo,
    descricao,
    textoBotao,
    onClick,
    children
}) {
    return (
        <div className="card-tiulo">

            <div className="titulo-descricao">
                {children}

                <h2>{titulo}</h2>

                <p>{descricao}</p>
            </div>

            {textoBotao && (
                <div className="botao-cadastro">
                    <button
                        type="button"
                        onClick={onClick}
                    >
                        <div className="nome-btn">
                            <img src={iconeSinalMais} alt="" />

                            <p className="titulo-botao">
                                {textoBotao}
                            </p>
                        </div>
                    </button>
                </div>
            )}

        </div>
    );
}

//----------------- EXPORTAÇÃO -----------------------------//

export default BotaoCadastro;