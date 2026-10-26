import colaboradorIcone from '../../img/colaborador-icon.svg';

function obterIniciais(nome) {
    return String(nome || '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(parte => parte.charAt(0))
        .join('')
        .toUpperCase();
}

function SelecaoColaborador({
    colaboradorSelecionado,
    pesquisaColaborador,
    dropdownAberto,
    dropdownRef,
    erros,
    carregandoColaboradores,
    erroCarregamento,
    colaboradoresFiltrados,
    nomeColaborador,
    matriculaColaborador,
    cargoColaborador,
    setorColaborador,
    gestorSelecionado,
    alterarPesquisaColaborador,
    selecionarColaborador,
    setDropdownAberto,
    obterCargo
}) {
    return (
        <section className="cartao-cadastro-ferias">

            <div className="cabecalho-card-ferias">
                <h2>
                    Seleção do Colaborador
                </h2>
            </div>

            <div className="campo-ferias">
                <label htmlFor="pesquisa-colaborador-ferias">
                    Colaborador
                    <span className="obrigatorio">*</span>
                </label>

                <div
                    className="dropdown-colaborador-ferias"
                    ref={dropdownRef}
                >
                    <div
                        className={`input-colaborador-ferias ${
                            erros.colaborador
                                ? 'input-ferias-erro'
                                : ''
                        }`}
                    >
                        <img
                            src={colaboradorIcone}
                            alt=""
                        />

                        <input
                            id="pesquisa-colaborador-ferias"
                            type="text"
                            value={pesquisaColaborador}
                            onChange={
                                alterarPesquisaColaborador
                            }
                            onFocus={() =>
                                setDropdownAberto(true)
                            }
                            placeholder={
                                carregandoColaboradores
                                    ? 'Carregando colaboradores...'
                                    : 'Digite o nome ou matrícula do colaborador'
                            }
                            autoComplete="off"
                            disabled={
                                carregandoColaboradores
                            }
                        />

                        {colaboradorSelecionado && (
                            <span className="status-ativo-ferias">
                                ● Ativo no sistema
                            </span>
                        )}

                        <span className="seta-dropdown-ferias">
                            ▾
                        </span>
                    </div>

                    {dropdownAberto &&
                        !carregandoColaboradores && (
                            <div className="lista-dropdown-ferias">

                                {colaboradoresFiltrados.length === 0 ? (
                                    <div className="dropdown-vazio-ferias">
                                        Nenhum colaborador encontrado.
                                    </div>
                                ) : (
                                    colaboradoresFiltrados.map(
                                        colaborador => (
                                            <button
                                                type="button"
                                                key={
                                                    colaborador.id
                                                }
                                                className="opcao-colaborador-ferias"
                                                onClick={() =>
                                                    selecionarColaborador(
                                                        colaborador
                                                    )
                                                }
                                            >
                                                <span className="icone-opcao-colaborador">
                                                    {obterIniciais(
                                                        colaborador.nome
                                                    )}
                                                </span>

                                                <span className="dados-opcao-colaborador">
                                                    <strong>
                                                        {
                                                            colaborador.nome
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            colaborador.matricula
                                                        }
                                                    </small>
                                                </span>
                                            </button>
                                        )
                                    )
                                )}

                            </div>
                        )}
                </div>

                {erros.colaborador && (
                    <small className="mensagem-erro-ferias">
                        {erros.colaborador}
                    </small>
                )}

                {erroCarregamento && (
                    <small className="mensagem-erro-ferias">
                        {erroCarregamento}
                    </small>
                )}
            </div>

            <div className="informacoes-colaborador-ferias">

                <div className="info-colaborador-ferias">
                    <span className="rotulo-info-ferias">
                        NOME COMPLETO
                    </span>

                    <strong>
                        {nomeColaborador ||
                            'Não selecionado'}
                    </strong>

                    <small>
                        Matrícula: {matriculaColaborador}
                    </small>
                </div>

                <div className="info-colaborador-ferias">
                    <span className="rotulo-info-ferias">
                        CARGO ATUAL
                    </span>

                    <strong>
                        {cargoColaborador}
                    </strong>

                    <small>
                        Vínculo:{' '}
                        {colaboradorSelecionado?.tipo_vinculo ||
                            'Não informado'}
                    </small>
                </div>

                <div className="info-colaborador-ferias">
                    <span className="rotulo-info-ferias">
                        SETOR / SQUAD
                    </span>

                    <strong>
                        {setorColaborador}
                    </strong>

                    <small>
                        {colaboradorSelecionado
                            ? 'Setor do colaborador'
                            : 'Não informado'}
                    </small>
                </div>

                <div className="info-colaborador-ferias">
                    <span className="rotulo-info-ferias">
                        GESTOR IMEDIATO
                    </span>

                    <strong>
                        {gestorSelecionado?.nome ||
                            'Gestor não vinculado'}
                    </strong>

                    <small>
                        {gestorSelecionado
                            ? obterCargo(gestorSelecionado)
                            : 'Nenhum gestor vinculado'}
                    </small>
                </div>

            </div>

            <div className="mensagem-vinculo-ferias">
                <span>✓</span>
                Dados vinculados automaticamente à ficha
                cadastral do colaborador no NexusHR.
            </div>

        </section>
    );
}

export default SelecaoColaborador;