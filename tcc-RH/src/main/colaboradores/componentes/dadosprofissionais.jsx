
import './dadosprofissionais.css';

function Dadosprofissionais({
    dados,
    setDados,
    cargos = [],
    setores = [],
    niveisAcesso = [],
    modoEdicao = false,
    erros = {},
    aoAlterarCampo
}) {

    //----------------- ATUALIZAR CAMPOS ---------------------//

    function atualizarCampo(campo, valor) {
        if (aoAlterarCampo) {
            aoAlterarCampo(campo, valor);
            return;
        }

        setDados({
            ...dados,
            [campo]: valor
        });
    }

    //----------------- CLASSE DO CAMPO ----------------------//

    function classeCampo(campo) {
        return erros[campo] ? 'campo-invalido' : '';
    }

    //----------------- MENSAGEM DE ERRO ---------------------//

    function mensagemErro(campo) {
        if (!erros[campo]) {
            return null;
        }

        return (
            <span className="mensagem-erro-colaborador">
                {erros[campo]}
            </span>
        );
    }

    //----------------- TELA ---------------------------------//

    return (
        <section className="card-dados-profissionais">

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

            <div className="campos-dados-profissionais">

                {/* MATRÍCULA */}

                <div className="campo-profissional">
                    <label htmlFor="matricula">
                        Matrícula *
                    </label>

                    <input
                        type="text"
                        id="matricula"
                        name="matricula"
                        placeholder="Digite a matrícula"
                        value={dados.matricula || ''}
                        className={classeCampo('matricula')}
                        onChange={(evento) =>
                            atualizarCampo('matricula', evento.target.value)
                        }
                        aria-invalid={Boolean(erros.matricula)}
                    />

                    {mensagemErro('matricula')}
                </div>

                {/* CARGO */}

                <div className="campo-profissional">
                    <label htmlFor="cargo">
                        Cargo *
                    </label>

                    <select
                        id="cargo"
                        name="idCargo"
                        value={dados.idCargo || ''}
                        className={classeCampo('idCargo')}
                        onChange={(evento) =>
                            atualizarCampo('idCargo', evento.target.value)
                        }
                        aria-invalid={Boolean(erros.idCargo)}
                    >
                        <option value="">
                            Selecione o cargo
                        </option>

                        {cargos.map((cargo) => (
                            <option key={cargo.id} value={cargo.id}>
                                {cargo.nome}
                            </option>
                        ))}
                    </select>

                    {mensagemErro('idCargo')}
                </div>

                {/* SETOR */}

                <div className="campo-profissional">
                    <label htmlFor="setor">
                        Setor *
                    </label>

                    <select
                        id="setor"
                        name="idSetor"
                        value={dados.idSetor || ''}
                        className={classeCampo('idSetor')}
                        onChange={(evento) =>
                            atualizarCampo('idSetor', evento.target.value)
                        }
                        aria-invalid={Boolean(erros.idSetor)}
                    >
                        <option value="">
                            Selecione o setor
                        </option>

                        {setores.map((setor) => (
                            <option key={setor.id} value={setor.id}>
                                {setor.nome}
                            </option>
                        ))}
                    </select>

                    {mensagemErro('idSetor')}
                </div>

                {/* TIPO DE VÍNCULO */}

                <div className="campo-profissional">
                    <label htmlFor="tipoVinculo">
                        Tipo de vínculo *
                    </label>

                    <select
                        id="tipoVinculo"
                        name="tipoVinculo"
                        value={dados.tipoVinculo || ''}
                        className={classeCampo('tipoVinculo')}
                        onChange={(evento) =>
                            atualizarCampo(
                                'tipoVinculo',
                                evento.target.value
                            )
                        }
                        aria-invalid={Boolean(erros.tipoVinculo)}
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

                    {mensagemErro('tipoVinculo')}
                </div>

                {/* LOGIN */}

                <div className="campo-profissional">
                    <label htmlFor="login">
                        Login *
                    </label>

                    <input
                        type="text"
                        id="login"
                        name="login"
                        placeholder="Digite o login de acesso"
                        autoComplete="username"
                        value={dados.login || ''}
                        className={classeCampo('login')}
                        onChange={(evento) =>
                            atualizarCampo('login', evento.target.value)
                        }
                        aria-invalid={Boolean(erros.login)}
                    />

                    {mensagemErro('login')}
                </div>

                {/* SENHA */}

                <div className="campo-profissional">
                    <label htmlFor="senha">
                        {modoEdicao ? 'Nova senha' : 'Senha *'}
                    </label>

                    <input
                        type="password"
                        id="senha"
                        name="senha"
                        placeholder={
                            modoEdicao
                                ? 'Deixe em branco para manter a senha atual'
                                : 'Digite a senha de acesso'
                        }
                        autoComplete="new-password"
                        value={dados.senha || ''}
                        className={classeCampo('senha')}
                        onChange={(evento) =>
                            atualizarCampo('senha', evento.target.value)
                        }
                        required={!modoEdicao}
                        aria-invalid={Boolean(erros.senha)}
                    />

                    {mensagemErro('senha')}
                </div>

                {/* NÍVEL DE ACESSO */}

                <div className="campo-profissional campo-nivel-acesso">
                    <label htmlFor="nivelAcesso">
                        Nível de acesso *
                    </label>

                    <select
                        id="nivelAcesso"
                        name="idNivelAcesso"
                        value={dados.idNivelAcesso || ''}
                        className={classeCampo('idNivelAcesso')}
                        onChange={(evento) =>
                            atualizarCampo(
                                'idNivelAcesso',
                                evento.target.value
                            )
                        }
                        aria-invalid={Boolean(erros.idNivelAcesso)}
                    >
                        <option value="">
                            Selecione o nível de acesso
                        </option>

                        {niveisAcesso.map((nivel) => (
                            <option key={nivel.id} value={nivel.id}>
                                {nivel.nome}
                            </option>
                        ))}
                    </select>

                    {mensagemErro('idNivelAcesso')}

                    <span className="ajuda-nivel-acesso">
                        Define as permissões do colaborador no sistema.
                    </span>
                </div>

            </div>
        </section>
    );
}

export default Dadosprofissionais;
