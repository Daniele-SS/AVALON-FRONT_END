
 //----------------- IMPORTAÇÕES -----------------------------//

import './dadosprofissionais.css';


//----------------- COMPONENTE ------------------------------//

function Dadosprofissionais({
    dados,
    setDados,
    cargos = [],
    setores = [],
    niveisAcesso = []
}) {

    //----------------- ATUALIZAR CAMPOS ---------------------//

    function atualizarCampo(campo, valor) {

        setDados({
            ...dados,
            [campo]: valor
        });

    }


    //----------------- TELA --------------------------------//

    return (

        <section className="card-dados-profissionais">

            {/* CABEÇALHO DO CARD */}

            <div className="cabecalho-dados-profissionais">

                <div className="titulo-dados-profissionais">

                    <h2>Dados profissionais</h2>

                    <p>
                        Informações profissionais e de acesso do colaborador.
                    </p>

                </div>

                <span className="etiqueta-profissionais">
                    Etapa essencial
                </span>

            </div>


            {/* CAMPOS DO FORMULÁRIO */}

            <div className="campos-dados-profissionais">

                {/* MATRÍCULA */}

                <div className="campo-profissional">

                    <label htmlFor="matricula">
                        Matrícula
                    </label>

                    <input
                        type="text"
                        id="matricula"
                        name="matricula"
                        placeholder="Digite a matrícula"
                        value={dados.matricula || ''}
                        onChange={(evento) =>
                            atualizarCampo(
                                'matricula',
                                evento.target.value
                            )
                        }
                    />

                </div>


                {/* CARGO */}

                <div className="campo-profissional">

                    <label htmlFor="cargo">
                        Cargo
                    </label>

                    <select
                        id="cargo"
                        name="idCargo"
                        value={dados.idCargo || ''}
                        onChange={(evento) =>
                            atualizarCampo(
                                'idCargo',
                                evento.target.value
                            )
                        }
                    >

                        <option value="">
                            Selecione o cargo
                        </option>

                        {cargos.map((cargo) => (

                            <option
                                key={cargo.id}
                                value={cargo.id}
                            >
                                {cargo.nome}
                            </option>

                        ))}

                    </select>

                </div>


                {/* SETOR */}

                <div className="campo-profissional">

                    <label htmlFor="setor">
                        Setor
                    </label>

                    <select
                        id="setor"
                        name="idSetor"
                        value={dados.idSetor || ''}
                        onChange={(evento) =>
                            atualizarCampo(
                                'idSetor',
                                evento.target.value
                            )
                        }
                    >

                        <option value="">
                            Selecione o setor
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

                </div>


                {/* TIPO DE VÍNCULO */}

                <div className="campo-profissional">

                    <label htmlFor="tipoVinculo">
                        Tipo de vínculo
                    </label>

                    <select
                        id="tipoVinculo"
                        name="tipoVinculo"
                        value={dados.tipoVinculo || ''}
                        onChange={(evento) =>
                            atualizarCampo(
                                'tipoVinculo',
                                evento.target.value
                            )
                        }
                    >

                        <option value="">
                            Selecione o vínculo
                        </option>

                        <option value="CLT">CLT</option>
                        <option value="PJ">PJ</option>
                        <option value="ESTÁGIO">Estágio</option>
                        <option value="JOVEM APRENDIZ">Jovem Aprendiz</option>
                        <option value="TEMPORARIO">Temporário</option>

                    </select>

                </div>


                {/* LOGIN */}

                <div className="campo-profissional">

                    <label htmlFor="login">
                        Login
                    </label>

                    <input
                        type="text"
                        id="login"
                        name="login"
                        placeholder="Digite o login de acesso"
                        autoComplete="username"
                        value={dados.login || ''}
                        onChange={(evento) =>
                            atualizarCampo(
                                'login',
                                evento.target.value
                            )
                        }
                    />

                </div>


                {/* SENHA */}

                <div className="campo-profissional">

                    <label htmlFor="senha">
                        Senha
                    </label>

                    <input
                        type="password"
                        id="senha"
                        name="senha"
                        placeholder="Digite a senha de acesso"
                        autoComplete="new-password"
                        value={dados.senha || ''}
                        onChange={(evento) =>
                            atualizarCampo(
                                'senha',
                                evento.target.value
                            )
                        }
                    />

                </div>


                {/* NÍVEL DE ACESSO */}

                <div className="campo-profissional campo-nivel-acesso">

                    <label htmlFor="nivelAcesso">
                        Nível de acesso
                    </label>

                    <select
                        id="nivelAcesso"
                        name="idNivelAcesso"
                        value={dados.idNivelAcesso || ''}
                        onChange={(evento) =>
                            atualizarCampo(
                                'idNivelAcesso',
                                evento.target.value
                            )
                        }
                    >

                        <option value="">
                            Selecione o nível de acesso
                        </option>

                        {niveisAcesso.map((nivel) => (

                            <option
                                key={nivel.id}
                                value={nivel.id}
                            >
                                {nivel.nome}
                            </option>

                        ))}

                    </select>

                    <span className="ajuda-nivel-acesso">
                        Define as permissões do colaborador no sistema.
                    </span>

                </div>

            </div>

        </section>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Dadosprofissionais;
