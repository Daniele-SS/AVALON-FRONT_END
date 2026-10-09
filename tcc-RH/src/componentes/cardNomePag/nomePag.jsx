import iconeSinalMais from '../img/sinalMais-icon.svg';

function BotaoCadastro({ titulo, descricao, textoBotao, onClick }) {
    return (
        <div className="card-tiulo">

            <div className="titulo-descricao">
                <h2>{titulo}</h2>
                <p>{descricao}</p>
            </div>

            <div className="botao-cadastro">
                <button type="button" onClick={onClick}>
                    <div className="nome-btn">
                        <img src={iconeSinalMais} alt="" />

                        <p className="titulo-botao">
                            {textoBotao}
                        </p>
                    </div>
                </button>
            </div>

        </div>
    );
}

export default BotaoCadastro;