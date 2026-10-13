//----------------- IMPORTAÇÕES ----------------------------//

import '../botoes/BotaoSalvarCancelar.css';


//----------------- COMPONENTE -----------------------------//

function BotaoSalvarCancelar({
    voltar,
    salvando,
    formularioValido,
    textoBotao = 'Salvar setor'
}) {

    //----------------- RETORNO JSX -------------------------//

    return (

        <div className="acoes-cadastro-setor">

            {/* CANCELAR */}

            <button
                type="button"
                className="botao-cancelar-setor"
                onClick={voltar}
            >
                × Cancelar
            </button>


            {/* SALVAR */}

            <button
                type="submit"
                className="botao-salvar-setor"
                disabled={salvando || !formularioValido}
            >

                {salvando
                    ? 'Salvando...'
                    : textoBotao}

            </button>

        </div>

    );
}


//----------------- EXPORTAÇÃO -----------------------------//

export default BotaoSalvarCancelar;