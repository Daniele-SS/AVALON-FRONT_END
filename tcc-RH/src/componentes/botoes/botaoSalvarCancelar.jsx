//----------------- IMPORTAÇÕES ----------------------------//

import '../botoes/BotaoSalvarCancelar.css';


//----------------- COMPONENTE -----------------------------//

function BotaoSalvarCancelar({
    voltar,
    onCancelar,
    onSalvar,
    salvando = false,
    formularioValido = true,
    textoBotao = 'Salvar',
}) {

    //----------------- CANCELAR ----------------------------//

    function cancelar() {
        if (onCancelar) {
            onCancelar();
        } else if (voltar) {
            voltar();
        }
    }


    //----------------- RETORNO JSX -------------------------//

    return (
        <div className="acoes-cadastro-setor">

            {/* CANCELAR */}

            <button
                type="button"
                className="botao-cancelar-setor"
                onClick={cancelar}
                disabled={salvando}
            >
                × Cancelar
            </button>


            {/* SALVAR */}

            <button
                type="button"
                className="botao-salvar-setor"
                onClick={onSalvar}
                disabled={salvando || !formularioValido}
            >
                {salvando ? 'Salvando...' : textoBotao}
            </button>

        </div>
    );
}


//----------------- EXPORTAÇÃO -----------------------------//

export default BotaoSalvarCancelar;