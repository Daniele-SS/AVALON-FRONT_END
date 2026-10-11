import '../minicard/minicard.css'

function Minicards({ icone, numero, informacao, corFundo,layout = "vertical" }) {
    return (
        <div className="item-minicard">

            <div className="minicard ">

                <div className={`conteudo-minicard layout-${layout}`}>

                    <div className="icone-minicard" style={{ backgroundColor: corFundo }}>
                        <img src={icone} alt="Ícone de colaboradores" />
                    </div>

                    <div className="info-minicard">
                        <h1>{numero}</h1>
                        <p>{informacao}</p>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Minicards;