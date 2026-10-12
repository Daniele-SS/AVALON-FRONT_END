//----------------- IMPORTAÇÕES ----------------------------//

import '../cardInformacoes/informacoes.css';


//----------------- COMPONENTE -----------------------------//

function Informacoes({
    titulo = 'Informações',
    descricaoCard = 'Preencha as informações do cadastro.',
    nomeEntidade = 'registro',
    nome,
    setNome,
    codigo,
    setCodigo,
    descricao,
    setDescricao,
    status,
    setStatus,
    campos = ['nome', 'codigo', 'descricao', 'status'],
    setores = [],
    setor,
    setSetor
}) {

    //----------------- RETORNO JSX ------------------------//

    return (
        <section className="cartao-informacoes">

            {/* TÍTULO */}

            <div className="cabecalho-informacoes">

                <div>
                    <h2>{titulo}</h2>
                    <p>{descricaoCard}</p>
                </div>

                <span className="etiqueta-etapa">
                    Etapa essencial
                </span>

            </div>


            {/* CAMPOS */}

            <div className="lista-campos">

                {/* NOME */}

                {campos.includes('nome') && (
                    <div className="campo-formulario">

                        <label htmlFor={`nome-${nomeEntidade}`}>
                            Nome do {nomeEntidade} *
                        </label>

                        <input
                            id={`nome-${nomeEntidade}`}
                            type="text"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder={`Ex.: Nome do ${nomeEntidade}`}
                            maxLength={100}
                            required
                        />

                        <small>
                            Informe um nome para identificar o {nomeEntidade}.
                        </small>

                    </div>
                )}


                {/* CÓDIGO */}

                {campos.includes('codigo') && (
                    <div className="campo-formulario">

                        <div className="rotulo-contador">

                            <label htmlFor={`codigo-${nomeEntidade}`}>
                                Código do {nomeEntidade} *
                            </label>

                            <span>2–6 CARACT.</span>

                        </div>

                        <input
                            id={`codigo-${nomeEntidade}`}
                            type="text"
                            value={codigo}
                            onChange={(evento) => setCodigo(evento.target.value.toUpperCase())}
                            placeholder="Ex.: PROD"
                            maxLength={6}
                            required
                        />

                        <small>
                            Use de 2 a 6 letras ou números.
                        </small>

                    </div>
                )}


                {/* SETOR RELACIONADO */}

                {campos.includes('setor') && (
                    <div className="campo-formulario">

                        <label htmlFor="setor-relacionado">
                            Setor relacionado *
                        </label>

                        <select
                            id="setor-relacionado"
                            value={setor}
                            onChange={(evento) => setSetor(evento.target.value)}
                            required
                        >

                            <option value="">
                                Selecione um setor
                            </option>

                            {setores.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nome}
                                </option>
                            ))}

                        </select>

                    </div>
                )}


                {/* DESCRIÇÃO */}

                {campos.includes('descricao') && (
                    <div className="campo-formulario campo-descricao">

                        <div className="rotulo-contador">

                            <label htmlFor={`descricao-${nomeEntidade}`}>
                                Descrição (opcional)
                            </label>

                            <span>
                                {descricao.length} / 300
                            </span>

                        </div>

                        <textarea
                            id={`descricao-${nomeEntidade}`}
                            value={descricao}
                            onChange={(evento) => setDescricao(evento.target.value)}
                            placeholder={`Descreva as responsabilidades deste ${nomeEntidade}...`}
                            maxLength={300}
                        />

                    </div>
                )}


                {/* STATUS */}

                {campos.includes('status') && (
                    <div className="campo-status">

                        <label className="rotulo-status">
                            Status operacional *
                        </label>

                        <div className="opcoes-status">

                            {/* ATIVO */}

                            <label
                                className={`opcao-status ${status === 1 ? 'status-selecionado' : ''}`}
                            >

                                <input
                                    type="radio"
                                    name={`status-${nomeEntidade}`}
                                    checked={status === 1}
                                    onChange={() => setStatus(1)}
                                />

                                <div>

                                    <strong>Ativo</strong>

                                    <span className="etiqueta-status etiqueta-ativo">
                                        ● Liberado
                                    </span>

                                    <p>
                                        Disponível para utilização.
                                    </p>

                                </div>

                            </label>


                            {/* INATIVO */}

                            <label
                                className={`opcao-status ${status === 0 ? 'status-selecionado' : ''}`}
                            >

                                <input
                                    type="radio"
                                    name={`status-${nomeEntidade}`}
                                    checked={status === 0}
                                    onChange={() => setStatus(0)}
                                />

                                <div>

                                    <strong>Inativo</strong>

                                    <span className="etiqueta-status etiqueta-inativo">
                                        ● Bloqueado
                                    </span>

                                    <p>
                                        Indisponível para utilização.
                                    </p>

                                </div>

                            </label>

                        </div>

                    </div>
                )}

            </div>

        </section>
    );
}


//----------------- EXPORTAÇÃO -----------------------------//

export default Informacoes;