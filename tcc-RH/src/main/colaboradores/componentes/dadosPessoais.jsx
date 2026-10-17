
//----------------- IMPORTAÇÕES -----------------------------//

import './dadospessoais.css';


//----------------- COMPONENTE ------------------------------//

function Dadospessoais({ dados, setDados }) {

    //----------------- ATUALIZAR CAMPO ---------------------//

    function atualizarCampo(campo, valor) {
        setDados({
            ...dados,
            [campo]: valor
        });
    }


    //----------------- RETORNO JSX -------------------------//

    return (

        <section className="cartao-informacoes">

            {/* CABEÇALHO */}

            <div className="cabecalho-informacoes">

                <div>
                    <h2>Dados pessoais</h2>

                    <p>
                        Preencha as informações pessoais do colaborador.
                    </p>
                </div>

                <span className="etiqueta-etapa">
                    Etapa essencial
                </span>

            </div>


            {/* CAMPOS */}

            <div className="lista-campos">

                {/* NOME COMPLETO */}

                <div className="campo-formulario campo-nome-colaborador">

                    <label htmlFor="nome-colaborador">
                        Nome completo *
                    </label>

                    <input
                        id="nome-colaborador"
                        type="text"
                        value={dados.nome}
                        onChange={(evento) =>
                            atualizarCampo('nome', evento.target.value)
                        }
                        placeholder="Digite o nome completo"
                        maxLength={100}
                        required
                    />

                </div>


                {/* E-MAIL */}

                <div className="campo-formulario">

                    <label htmlFor="email-colaborador">
                        E-mail *
                    </label>

                    <input
                        id="email-colaborador"
                        type="email"
                        value={dados.email}
                        onChange={(evento) =>
                            atualizarCampo('email', evento.target.value)
                        }
                        placeholder="exemplo@email.com"
                        maxLength={150}
                        required
                    />

                </div>


                {/* CPF */}

                <div className="campo-formulario">

                    <label htmlFor="cpf-colaborador">
                        CPF *
                    </label>

                    <input
                        id="cpf-colaborador"
                        type="text"
                        value={dados.cpf}
                        onChange={(evento) =>
                            atualizarCampo('cpf', evento.target.value)
                        }
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                    />

                </div>


                {/* TELEFONE */}

                <div className="campo-formulario">

                    <label htmlFor="telefone-colaborador">
                        Telefone
                    </label>

                    <input
                        id="telefone-colaborador"
                        type="tel"
                        value={dados.telefone}
                        onChange={(evento) =>
                            atualizarCampo('telefone', evento.target.value)
                        }
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                    />

                </div>


                {/* DATA DE NASCIMENTO */}

                <div className="campo-formulario">

                    <label htmlFor="nascimento-colaborador">
                        Data de nascimento
                    </label>

                    <input
                        id="nascimento-colaborador"
                        type="date"
                        value={dados.dataNascimento}
                        onChange={(evento) =>
                            atualizarCampo(
                                'dataNascimento',
                                evento.target.value
                            )
                        }
                    />

                </div>


                {/* STATUS */}

                <div className="campo-status">

                    <label className="rotulo-status">
                        Status *
                    </label>

                    <div className="opcoes-status">

                        {/* ATIVO */}

                        <label
                            className={`opcao-status ${
                                dados.status === 1
                                    ? 'status-selecionado'
                                    : ''
                            }`}
                        >

                            <input
                                type="radio"
                                name="status-colaborador"
                                checked={dados.status === 1}
                                onChange={() =>
                                    atualizarCampo('status', 1)
                                }
                            />

                            <div>

                                <strong>Ativo</strong>

                                <span className="etiqueta-status etiqueta-ativo">
                                    ● Liberado
                                </span>

                                <p>
                                    Colaborador com acesso ao sistema.
                                </p>

                            </div>

                        </label>


                        {/* INATIVO */}

                        <label
                            className={`opcao-status ${
                                dados.status === 0
                                    ? 'status-selecionado'
                                    : ''
                            }`}
                        >

                            <input
                                type="radio"
                                name="status-colaborador"
                                checked={dados.status === 0}
                                onChange={() =>
                                    atualizarCampo('status', 0)
                                }
                            />

                            <div>

                                <strong>Inativo</strong>

                                <span className="etiqueta-status etiqueta-inativo">
                                    ● Bloqueado
                                </span>

                                <p>
                                    Colaborador sem acesso ao sistema.
                                </p>

                            </div>

                        </label>

                    </div>

                </div>

            </div>

        </section>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Dadospessoais;
