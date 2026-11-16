
import './css-componentes/selecaoPublico.css';

//----------------- SELEÇÃO DO PÚBLICO -----------------------//

function SelecaoPublico({
    publicoSelecionado,
    setPublicoSelecionado,
    setores = [],
    cargos = [],
    setoresSelecionados = [],
    cargosSelecionados = [],
    setSetoresSelecionados,
    setCargosSelecionados,
    limparErro,
    erro
}) {

    //----------------- ALTERAR PÚBLICO ----------------------//

    function alterarPublico(valor) {

        setPublicoSelecionado(valor);

        // Limpa as seleções anteriores ao trocar o público
        setSetoresSelecionados([]);
        setCargosSelecionados([]);

        if (limparErro) {
            limparErro('publico');
        }

    }


    //----------------- ALTERAR SETOR ------------------------//

    function alterarSetor(id) {

        const idNumerico = Number(id);

        const selecionados = setoresSelecionados.some(
            item => Number(item) === idNumerico
        )
            ? setoresSelecionados.filter(
                item => Number(item) !== idNumerico
            )
            : [...setoresSelecionados, idNumerico];

        setSetoresSelecionados(selecionados);

        if (limparErro) {
            limparErro('publico');
        }

    }


    //----------------- ALTERAR CARGO ------------------------//

    function alterarCargo(id) {

        const idNumerico = Number(id);

        const selecionados = cargosSelecionados.some(
            item => Number(item) === idNumerico
        )
            ? cargosSelecionados.filter(
                item => Number(item) !== idNumerico
            )
            : [...cargosSelecionados, idNumerico];

        setCargosSelecionados(selecionados);

        if (limparErro) {
            limparErro('publico');
        }

    }


    //----------------- TELA ---------------------------------//

    return (

        <section className="cartao-publico-avaliacao">

            <div className="cabecalho-publico-avaliacao">

                <h2>Público da avaliação</h2>

                <p>
                    Defina quais colaboradores poderão participar desta avaliação.
                </p>

            </div>


            {/* OPÇÕES DE PÚBLICO */}

            <div className="opcoes-publico-avaliacao">

                <label className="opcao-publico-avaliacao">

                    <input
                        type="radio"
                        name="publico"
                        value="TODOS"
                        checked={publicoSelecionado === 'TODOS'}
                        onChange={() => alterarPublico('TODOS')}
                    />

                    <span>Todos os colaboradores</span>

                </label>


                <label className="opcao-publico-avaliacao">

                    <input
                        type="radio"
                        name="publico"
                        value="SETOR"
                        checked={publicoSelecionado === 'SETOR'}
                        onChange={() => alterarPublico('SETOR')}
                    />

                    <span>Setores específicos</span>

                </label>


                <label className="opcao-publico-avaliacao">

                    <input
                        type="radio"
                        name="publico"
                        value="CARGO"
                        checked={publicoSelecionado === 'CARGO'}
                        onChange={() => alterarPublico('CARGO')}
                    />

                    <span>Cargos específicos</span>

                </label>

            </div>


            {/* SELEÇÃO DE SETORES */}

            {publicoSelecionado === 'SETOR' && (

                <div className="selecao-itens-publico">

                    <h3>Selecione os setores</h3>

                    {setores.length === 0 ? (

                        <p>Nenhum setor disponível.</p>

                    ) : (

                        <div className="lista-itens-publico">

                            {setores.map(setor => (

                                <label key={setor.id}>

                                    <input
                                        type="checkbox"
                                        checked={setoresSelecionados.some(
                                            id => Number(id) === Number(setor.id)
                                        )}
                                        onChange={() => alterarSetor(setor.id)}
                                    />

                                    <span>{setor.nome}</span>

                                </label>

                            ))}

                        </div>

                    )}

                </div>

            )}


            {/* SELEÇÃO DE CARGOS */}

            {publicoSelecionado === 'CARGO' && (

                <div className="selecao-itens-publico">

                    <h3>Selecione os cargos</h3>

                    {cargos.length === 0 ? (

                        <p>Nenhum cargo disponível.</p>

                    ) : (

                        <div className="lista-itens-publico">

                            {cargos.map(cargo => (

                                <label key={cargo.id}>

                                    <input
                                        type="checkbox"
                                        checked={cargosSelecionados.some(
                                            id => Number(id) === Number(cargo.id)
                                        )}
                                        onChange={() => alterarCargo(cargo.id)}
                                    />

                                    <span>{cargo.nome}</span>

                                </label>

                            ))}

                        </div>

                    )}

                </div>

            )}


            {/* MENSAGEM DE ERRO */}

            {erro && (
                <p className="erro-publico-avaliacao">
                    {erro}
                </p>
            )}

        </section>

    );

}

export default SelecaoPublico;
