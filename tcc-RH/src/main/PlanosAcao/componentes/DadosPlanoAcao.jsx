import './css-componentes/dadosPlanoAcao.css';


//----------------- COMPONENTE ------------------------------//

function DadosPlanoAcao({
    titulo,
    setTitulo,
    descricao,
    setDescricao,
    objetivo,
    setObjetivo,
    idSetor,
    setIdSetor,
    setores,
    idFator,
    setIdFator,
    fatores,
    desabilitado
}) {

    return (

        <section className="dados-acao-plano">

            {/* CABEÇALHO */}

            <div className="cabecalho-dados-acao">

                <h2>
                    Defina a ação a ser realizada
                </h2>

                <p>
                    Defina diretrizes pragmáticas e objetivos.
                    Planos claros aceleram a execução pelas
                    lideranças operacionais.
                </p>

            </div>


            {/* TÍTULO DA AÇÃO */}

            <div className="campo-dados-acao">

                <div className="cabecalho-campo-acao">

                    <label htmlFor="titulo-plano">
                        Título da ação <span>*</span>
                    </label>

                    <small>
                        {titulo.length}/100 caracteres
                    </small>

                </div>

                <input
                    id="titulo-plano"
                    type="text"
                    value={titulo}
                    onChange={(evento) =>
                        setTitulo(evento.target.value)
                    }
                    placeholder="Digite o título da ação"
                    maxLength={100}
                    disabled={desabilitado}
                />

            </div>


            {/* DESCRIÇÃO DETALHADA */}

            <div className="campo-dados-acao">

                <div className="cabecalho-campo-acao">

                    <label htmlFor="descricao-plano">
                        Descrição detalhada da ação <span>*</span>
                    </label>

                    <small>
                        Instruções para a liderança
                    </small>

                </div>

                <textarea
                    id="descricao-plano"
                    value={descricao}
                    onChange={(evento) =>
                        setDescricao(evento.target.value)
                    }
                    placeholder="Descreva detalhadamente a ação que deverá ser realizada."
                    rows={4}
                    disabled={desabilitado}
                />

            </div>


            {/* SETOR RELACIONADO */}

            <div className="campo-dados-acao">

                <label htmlFor="setor-plano">
                    Setor relacionado <span>*</span>
                </label>

                <select
                    id="setor-plano"
                    value={idSetor}
                    onChange={(evento) =>
                        setIdSetor(evento.target.value)
                    }
                    disabled={desabilitado}
                >

                    <option value="">
                        Selecione um setor
                    </option>

                    {setores.map((setor) => (

                        <option
                            key={setor.id}
                            value={setor.id}
                        >
                            {setor.nome}
                        </option>

                    ))}

                </select>

                <small className="ajuda-campo-acao">
                    Setor correspondente à amostra da avaliação
                    crítica selecionada.
                </small>

            </div>


            {/* FATOR PSICOSSOCIAL */}

            <div className="campo-dados-acao">

                <label htmlFor="fator-plano">
                    Fator psicossocial <span>*</span>
                </label>

                <select
                    id="fator-plano"
                    value={idFator}
                    onChange={(evento) =>
                        setIdFator(evento.target.value)
                    }
                    disabled={desabilitado}
                >

                    <option value="">
                        Selecione um fator psicossocial
                    </option>

                    {fatores.map((fator) => (

                        <option
                            key={fator.id}
                            value={fator.id}
                        >
                            {fator.nome}
                        </option>

                    ))}

                </select>

            </div>


            {/* OBJETIVO ESPERADO */}

            <div className="campo-dados-acao">

                <label htmlFor="objetivo-plano">
                    Objetivo esperado <span>*</span>
                </label>

                <input
                    id="objetivo-plano"
                    type="text"
                    value={objetivo}
                    onChange={(evento) =>
                        setObjetivo(evento.target.value)
                    }
                    placeholder="Descreva o resultado esperado"
                    disabled={desabilitado}
                />

            </div>

        </section>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default DadosPlanoAcao;