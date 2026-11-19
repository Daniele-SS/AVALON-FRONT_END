
import './css-componentes/selecaoRegras.css';


//----------------- OBTER ID DO FATOR DA REGRA ----------------//

function obterIdFatorRegra(regra) {

    return Number(
        regra.id_psicossocial_fator ??
        regra.fator_psicossocial?.psicossocialFator?.id ??
        regra.fator_psicossocial?.id
    );

}


//----------------- COMPONENTE -------------------------------//

function SelecaoRegras({
    fatores,
    fatoresSelecionados,
    regras,
    regrasSelecionadas,
    setRegrasSelecionadas
}) {

    // Mantém somente os fatores escolhidos na avaliação.
    const fatoresDaAvaliacao = fatores.filter(fator =>
        fatoresSelecionados.includes(Number(fator.id))
    );


    //----------------- SELECIONAR REGRA ----------------------//

    function alterarRegra(regra, idFator, selecionado) {

        const idRegra = Number(regra.id);

        if (selecionado) {

            setRegrasSelecionadas(anteriores => {

                // Evita cadastrar a mesma regra duas vezes.
                if (anteriores.some(item =>
                    Number(item.id_motor_regras) === idRegra
                )) {
                    return anteriores;
                }

                return [
                    ...anteriores,
                    {
                        id_motor_regras: idRegra,
                        id_psicossocial_fator: Number(idFator)
                    }
                ];

            });

        } else {

            setRegrasSelecionadas(anteriores =>
                anteriores.filter(item =>
                    Number(item.id_motor_regras) !== idRegra
                )
            );

        }

    }


    //----------------- TELA ---------------------------------//

    return (

        <div className="selecao-regras-avaliacao">

            {fatoresDaAvaliacao.length === 0 ? (

                <p className="mensagem-regras-avaliacao">
                    Selecione pelo menos um fator psicossocial para visualizar
                    as regras disponíveis.
                </p>

            ) : (

                fatoresDaAvaliacao.map(fator => {

                    // Busca somente regras ativas do fator atual.
                    const regrasDoFator = regras.filter(regra =>
                        obterIdFatorRegra(regra) === Number(fator.id) &&
                        Number(regra.ativo) === 1
                    );

                    return (

                        <section
                            className="grupo-regras-avaliacao"
                            key={fator.id}
                        >

                            <div className="cabecalho-grupo-regras">

                                <h3>
                                    {fator.nome}
                                </h3>

                                <span>
                                    {regrasDoFator.length} regras disponíveis
                                </span>

                            </div>


                            {regrasDoFator.length === 0 ? (

                                <p className="mensagem-regras-avaliacao">
                                    Nenhuma regra ativa cadastrada para este fator.
                                </p>

                            ) : (

                                <div className="lista-regras-avaliacao">

                                    {regrasDoFator.map(regra => {

                                        const selecionada =
                                            regrasSelecionadas.some(item =>
                                                Number(item.id_motor_regras) ===
                                                Number(regra.id)
                                            );

                                        return (

                                            <label
                                                className={`item-regra-avaliacao ${
                                                    selecionada ? 'regra-selecionada' : ''
                                                }`}
                                                key={regra.id}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={selecionada}
                                                    onChange={evento =>
                                                        alterarRegra(
                                                            regra,
                                                            fator.id,
                                                            evento.target.checked
                                                        )
                                                    }
                                                />

                                                <div className="informacoes-regra-avaliacao">

                                                    <strong>
                                                        {regra.operador} {regra.valor_referencial}
                                                    </strong>

                                                    <span>
                                                        Classificação: {regra.classificacao}
                                                    </span>

                                                    <p>
                                                        {regra.acao}
                                                    </p>

                                                </div>

                                            </label>

                                        );

                                    })}

                                </div>

                            )}

                        </section>

                    );

                })

            )}

            <div className="rodape-selecao-regras">

                <span>
                    {regrasSelecionadas.length} regras selecionadas
                </span>

                <p>
                    Somente as regras selecionadas serão vinculadas a esta avaliação.
                </p>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO -------------------------------//

export default SelecaoRegras;
