
import './dadospessoais.css';

function Dadospessoais({
    dados,
    setDados,
    erros = {},
    aoAlterarCampo
}) {

    //----------------- FORMATAR CPF -------------------------//

    function formatarCPF(valor) {
        // Deixa somente os números
        let numeros = String(valor || '')
            .replace(/\D/g, '')
            .slice(0, 11);

        // Adiciona os pontos e o hífen progressivamente
        if (numeros.length > 9) {
            numeros =
                numeros.slice(0, 3) + '.' +
                numeros.slice(3, 6) + '.' +
                numeros.slice(6, 9) + '-' +
                numeros.slice(9);
        } else if (numeros.length > 6) {
            numeros =
                numeros.slice(0, 3) + '.' +
                numeros.slice(3, 6) + '.' +
                numeros.slice(6);
        } else if (numeros.length > 3) {
            numeros =
                numeros.slice(0, 3) + '.' +
                numeros.slice(3);
        }

        return numeros;
    }

    //----------------- FORMATAR TELEFONE --------------------//

    function formatarTelefone(valor) {
        // Deixa somente os números
        const numeros = String(valor || '')
            .replace(/\D/g, '')
            .slice(0, 11);

        if (numeros.length === 0) {
            return '';
        }

        if (numeros.length <= 2) {
            return '(' + numeros;
        }

        if (numeros.length <= 6) {
            return '(' + numeros.slice(0, 2) + ') ' +
                numeros.slice(2);
        }

        if (numeros.length <= 10) {
            return '(' + numeros.slice(0, 2) + ') ' +
                numeros.slice(2, 6) + '-' +
                numeros.slice(6);
        }

        return '(' + numeros.slice(0, 2) + ') ' +
            numeros.slice(2, 7) + '-' +
            numeros.slice(7);
    }

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

    //----------------- TELA ---------------------------------//

    return (
        <section className="cartao-informacoes">

            <div className="cabecalho-informacoes">
                <div>
                    <h2>Dados pessoais</h2>
                    <p>Preencha as informações pessoais do colaborador.</p>
                </div>

                <span className="etiqueta-etapa">
                    Etapa essencial
                </span>
            </div>

            <div className="lista-campos">

                {/* NOME COMPLETO */}

                <div className="campo-formulario campo-nome-colaborador">
                    <label htmlFor="nome-colaborador">
                        Nome completo *
                    </label>

                    <input
                        id="nome-colaborador"
                        type="text"
                        value={dados.nome || ''}
                        className={classeCampo('nome')}
                        onChange={(evento) =>
                            atualizarCampo('nome', evento.target.value)
                        }
                        placeholder="Digite o nome completo"
                        maxLength={100}
                        required
                        aria-invalid={Boolean(erros.nome)}
                        aria-describedby={
                            erros.nome ? 'erro-nome-colaborador' : undefined
                        }
                    />

                    {erros.nome && (
                        <span
                            id="erro-nome-colaborador"
                            className="mensagem-erro-colaborador"
                        >
                            {erros.nome}
                        </span>
                    )}
                </div>

                {/* E-MAIL */}

                <div className="campo-formulario">
                    <label htmlFor="email-colaborador">
                        E-mail *
                    </label>

                    <input
                        id="email-colaborador"
                        type="email"
                        value={dados.email || ''}
                        className={classeCampo('email')}
                        onChange={(evento) =>
                            atualizarCampo('email', evento.target.value)
                        }
                        placeholder="exemplo@email.com"
                        maxLength={150}
                        required
                        aria-invalid={Boolean(erros.email)}
                        aria-describedby={
                            erros.email ? 'erro-email-colaborador' : undefined
                        }
                    />

                    {erros.email && (
                        <span
                            id="erro-email-colaborador"
                            className="mensagem-erro-colaborador"
                        >
                            {erros.email}
                        </span>
                    )}
                </div>

                {/* CPF */}

                <div className="campo-formulario">
                    <label htmlFor="cpf-colaborador">
                        CPF *
                    </label>

                    <input
                        id="cpf-colaborador"
                        type="text"
                        value={formatarCPF(dados.cpf)}
                        className={classeCampo('cpf')}
                        onChange={(evento) => {
                            const cpfFormatado = formatarCPF(
                                evento.target.value
                            );

                            atualizarCampo('cpf', cpfFormatado);
                        }}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        inputMode="numeric"
                        required
                        aria-invalid={Boolean(erros.cpf)}
                        aria-describedby={
                            erros.cpf ? 'erro-cpf-colaborador' : undefined
                        }
                    />

                    {erros.cpf && (
                        <span
                            id="erro-cpf-colaborador"
                            className="mensagem-erro-colaborador"
                        >
                            {erros.cpf}
                        </span>
                    )}
                </div>

                {/* TELEFONE OPCIONAL */}

                <div className="campo-formulario">
                    <label htmlFor="telefone-colaborador">
                        Telefone
                    </label>

                    <input
                        id="telefone-colaborador"
                        type="tel"
                        value={formatarTelefone(dados.telefone)}
                        onChange={(evento) => {
                            const telefoneFormatado = formatarTelefone(
                                evento.target.value
                            );

                            atualizarCampo(
                                'telefone',
                                telefoneFormatado
                            );
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        inputMode="numeric"
                    />
                </div>

                {/* DATA DE NASCIMENTO OPCIONAL */}

                <div className="campo-formulario">
                    <label htmlFor="nascimento-colaborador">
                        Data de nascimento
                    </label>

                    <input
                        id="nascimento-colaborador"
                        type="date"
                        value={dados.dataNascimento || ''}
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
                                onChange={() => atualizarCampo('status', 1)}
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
                                onChange={() => atualizarCampo('status', 0)}
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

export default Dadospessoais;
