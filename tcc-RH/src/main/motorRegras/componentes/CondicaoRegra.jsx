
//----------------- IMPORTAÇÕES -----------------------------//

import './css-componentes/condicaoRegra.css';


//----------------- OPÇÕES DOS OPERADORES --------------------//

const opcoesOperadores = [
    { valor: '<', nome: 'Menor que (<)' },
    { valor: '<=', nome: 'Menor ou igual (<=)' },
    { valor: '>', nome: 'Maior que (>)' },
    { valor: '>=', nome: 'Maior ou igual (>=)' },
    { valor: '==', nome: 'Igual a (=)' },
    { valor: '!=', nome: 'Diferente de (!=)' }
];


//----------------- COMPONENTE -------------------------------//

function CondicaoRegra({

    fator,
    setFator,

    fatores,
    carregandoFatores,
    erroFatores,

    operador,
    setOperador,

    valorReferencia,
    alterarValorReferencia,

    erroValor

}) {

    return (

        <div className="area-gatilho-regra">


            {/* CABEÇALHO DO GATILHO */}

            <div className="cabecalho-gatilho-regra">

                <div className="identificacao-gatilho-regra">

                    <span className="etiqueta-se-regra">
                        SE
                    </span>

                    <span className="titulo-gatilho-regra">
                        GATILHO PRIMÁRIO
                    </span>

                </div>


                <span className="execucao-continua-regra">

                    <span>ϟ</span>

                    Execução Contínua

                </span>

            </div>


            {/* CAMPOS DA CONDIÇÃO PRINCIPAL */}

            <div className="campos-condicao-regra">


                {/* DADO A ANALISAR */}

                <div className="campo-condicao-regra">

                    <label htmlFor="fator-regra">
                        DADO A ANALISAR
                    </label>

                    <select
                        id="fator-regra"
                        value={fator}
                        onChange={(evento) => setFator(evento.target.value)}
                        disabled={carregandoFatores || fatores.length === 0}
                    >

                        <option value="">
                            {carregandoFatores
                                ? 'Carregando fatores...'
                                : 'Selecione um fator'}
                        </option>

                        {fatores.map((opcao) => (

                            <option
                                key={opcao.id}
                                value={String(opcao.id)}
                            >
                                {opcao.nome}
                            </option>

                        ))}

                    </select>

                    {erroFatores && (

                        <small className="mensagem-erro-regra">
                            {erroFatores}
                        </small>

                    )}

                    {!carregandoFatores &&
                        !erroFatores &&
                        fatores.length === 0 && (

                            <small className="mensagem-erro-regra">
                                Nenhum fator psicossocial ativo encontrado.
                            </small>

                        )}

                </div>


                {/* OPERADOR */}

                <div className="campo-condicao-regra">

                    <label htmlFor="operador-regra">
                        OPERADOR
                    </label>

                    <select
                        id="operador-regra"
                        value={operador}
                        onChange={(evento) => setOperador(evento.target.value)}
                    >

                        {opcoesOperadores.map((opcao) => (

                            <option
                                key={opcao.valor}
                                value={opcao.valor}
                            >
                                {opcao.nome}
                            </option>

                        ))}

                    </select>

                </div>


                {/* VALOR DE REFERÊNCIA */}

                <div className="campo-condicao-regra">

                    <div className="label-valor-regra">

                        <label htmlFor="valor-regra">
                            VALOR REFERÊNCIA
                        </label>

                        <span>Escala 1 - 5</span>

                    </div>


                    <div className={`input-valor-regra ${erroValor ? 'input-valor-erro' : ''}`}>

                        <input
                            id="valor-regra"
                            type="text"
                            inputMode="decimal"
                            placeholder="Ex: 2.5"
                            value={valorReferencia}
                            onChange={(evento) =>
                                alterarValorReferencia(evento.target.value)
                            }
                            aria-invalid={Boolean(erroValor)}
                        />

                        <span>pts</span>

                    </div>


                    {erroValor && (

                        <small className="mensagem-erro-regra">
                            {erroValor}
                        </small>

                    )}

                </div>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CondicaoRegra;
