//----------------- IMPORTAÇÕES ----------------------------//

import './responsavel.css';


//----------------- COMPONENTE -----------------------------//

function ResponsavelSetor({
    responsavel,
    setResponsavel,
    colaboradores = [],
    nivelGestor,
    carregando
}) {

    //----------------- RETORNO JSX ------------------------//

    return (

        <section className="cartao-responsavel">

            {/* CABEÇALHO */}

            <div className="cabecalho-responsavel">

                <div>

                    <h2>Responsável pelo setor</h2>

                    <p>
                        Defina o gestor responsável por este setor.
                    </p>

                </div>

                <span className="etiqueta-opcional">
                    Opcional
                </span>

            </div>


            {/* CAMPO RESPONSÁVEL */}

            <div className="campo-formulario">

                <label htmlFor="responsavel-setor">
                    Gestor responsável
                </label>

                <select
                    id="responsavel-setor"
                    value={responsavel}
                    onChange={(evento) =>
                        setResponsavel(evento.target.value)
                    }
                    disabled={carregando || !nivelGestor}
                >

                    <option value="">
                        {carregando
                            ? 'Carregando dados...'
                            : !nivelGestor
                                ? 'Nível de gestor não encontrado'
                                : 'Selecione um gestor'}
                    </option>

                    {colaboradores.map((item) => (

                        <option
                            key={item.id}
                            value={item.id}
                        >
                            {item.nome}
                        </option>

                    ))}

                </select>

                <small>
                    {nivelGestor
                        ? `Nível de acesso: ${nivelGestor.nome}.`
                        : 'A seleção depende da identificação dos gestores pela API.'}
                </small>

            </div>

        </section>

    );
}


//----------------- EXPORTAÇÃO -----------------------------//

export default ResponsavelSetor;