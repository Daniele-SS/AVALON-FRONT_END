
//----------------- IMPORTAÇÕES -----------------------------//

import './css-componentes/resultadoCondicaoRegra.css';


//----------------- COMPONENTE -------------------------------//

function ResultadoCondicaoRegra({

    fator,
    operador,
    valorReferencia

}) {

    //----------------- DESCRIÇÃO DO OPERADOR ----------------//

    function obterDescricaoOperador() {

        if (operador === '<') return 'registrar um valor inferior a';

        if (operador === '<=') return 'registrar um valor menor ou igual a';

        if (operador === '>') return 'registrar um valor superior a';

        if (operador === '>=') return 'registrar um valor maior ou igual a';

        if (operador === '=') return 'registrar um valor igual a';

        if (operador === '<>') return 'registrar um valor diferente de';

        return '';

    }


    //----------------- NOME DO OPERADOR --------------------//

    function obterNomeOperador() {

        if (operador === '<') return 'MENOR QUE (<)';

        if (operador === '<=') return 'MENOR OU IGUAL (<=)';

        if (operador === '>') return 'MAIOR QUE (>)';

        if (operador === '>=') return 'MAIOR OU IGUAL (>=)';

        if (operador === '=') return 'IGUAL A (=)';

        if (operador === '<>') return 'DIFERENTE DE (<>)';

        return operador;

    }


    //----------------- TELA --------------------------------//

    return (

        <section className="resultado-condicao-regra">


            {/* CABEÇALHO */}

            <div className="cabecalho-resultado-regra">

                <h3>

                    <span>♧</span>

                    Resultado da condição lógica

                </h3>

                <span className="etiqueta-previa-regra">
                    Prévia em tempo real
                </span>

            </div>


            {/* EXPRESSÃO DA REGRA */}

            <div className="expressao-condicao-regra">

                <span className="expressao-se-regra">
                    SE
                </span>

                <span className="expressao-etiqueta-regra">
                    Indicador
                </span>

                <span>de</span>

                <strong className="expressao-fator-regra">
                    {fator || 'Selecione um fator'}
                </strong>

                <strong className="expressao-operador-regra">
                    {obterNomeOperador()}
                </strong>

                <strong className="expressao-valor-regra">
                    {valorReferencia || '...'}
                </strong>

            </div>


            {/* DESCRIÇÃO DA REGRA */}

            <p className="descricao-resultado-regra">

                Esta regra será acionada automaticamente sempre que
                o indicador consolidado de <strong>{fator || '...'}</strong>{' '}

                {obterDescricaoOperador()}

                {' '}

                <strong>{valorReferencia || '...'}</strong>.

            </p>

        </section>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default ResultadoCondicaoRegra;
