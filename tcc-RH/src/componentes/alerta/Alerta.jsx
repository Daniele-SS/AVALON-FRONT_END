
import { useEffect } from 'react';

import './alerta.css';


//----------------- COMPONENTE DE ALERTA -----------------------//

function Alerta({

    tipo = 'informacao',
    mensagem = '',
    onFechar,
    duracao = 5000

}) {

    //----------------- FECHAR AUTOMATICAMENTE ----------------//

    useEffect(() => {

        if (
            !mensagem ||
            !onFechar ||
            duracao <= 0
        ) {
            return;
        }

        const temporizador = setTimeout(() => {

            onFechar();

        }, duracao);

        return () => {

            clearTimeout(temporizador);

        };

    }, [
        mensagem,
        onFechar,
        duracao
    ]);


    //----------------- ÍCONES -------------------------------//

    const icones = {

        sucesso: '✓',

        erro: '✕',

        atencao: '!',

        informacao: 'i'

    };


    //----------------- ACESSIBILIDADE -----------------------//

    const tipoAria =
        tipo === 'erro' || tipo === 'atencao'
            ? 'alert'
            : 'status';


    //----------------- NÃO EXIBIR SEM MENSAGEM --------------//

    if (!mensagem) {
        return null;
    }


    //----------------- EXIBIÇÃO -----------------------------//

    return (

        <div
            className={`alerta alerta-${tipo}`}
            role={tipoAria}
            aria-live={
                tipo === 'erro' || tipo === 'atencao'
                    ? 'assertive'
                    : 'polite'
            }
        >

            <span className="alerta-icone">

                {icones[tipo] || icones.informacao}

            </span>

            <p className="alerta-mensagem">

                {mensagem}

            </p>

            {onFechar && (

                <button
                    type="button"
                    className="alerta-fechar"
                    onClick={onFechar}
                    aria-label="Fechar aviso"
                >

                    ×

                </button>

            )}

        </div>

    );

}


//----------------- EXPORTAÇÃO -------------------------------//

export default Alerta;
