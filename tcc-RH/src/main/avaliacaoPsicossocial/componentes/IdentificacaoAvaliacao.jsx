
import './css-componentes/identificacaoAvaliacao.css';

//----------------- IDENTIFICAÇÃO DA AVALIAÇÃO ---------------//

function IdentificacaoAvaliacao({
    titulo,
    setTitulo,
    descricao,
    setDescricao,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    anonimato,
    setAnonimato,
    erros,
    limparErro
}) {

    return (

        <div className="cartao-identificacao-avaliacao">


            {/* TÍTULO */}

            <div className="campo-avaliacao">

                <div className="rotulo-campo-avaliacao">

                    <label htmlFor="titulo-avaliacao">
                        Título da avaliação <span>*</span>
                    </label>

                    <small>{titulo.length} / 100</small>

                </div>

                <input
                    id="titulo-avaliacao"
                    type="text"
                    placeholder="Ex: Avaliação Psicossocial - 2026"
                    maxLength={100}
                    value={titulo}
                    onChange={(evento) => {
                        setTitulo(evento.target.value);
                        limparErro('titulo');
                    }}
                    className={erros.titulo ? 'campo-avaliacao-erro' : ''}
                />

                {erros.titulo && (
                    <small className="mensagem-erro-avaliacao">
                        {erros.titulo}
                    </small>
                )}

            </div>


            {/* DESCRIÇÃO */}

            <div className="campo-avaliacao">

                <div className="rotulo-campo-avaliacao">

                    <label htmlFor="descricao-avaliacao">
                        Descrição da avaliação
                    </label>

                    <small>{descricao.length} / 255</small>

                </div>

                <textarea
                    id="descricao-avaliacao"
                    placeholder="Descreva o objetivo desta avaliação."
                    maxLength={255}
                    value={descricao}
                    onChange={(evento) => {
                        setDescricao(evento.target.value);
                        limparErro('descricao');
                    }}
                    className={erros.descricao ? 'campo-avaliacao-erro' : ''}
                />

                {erros.descricao && (
                    <small className="mensagem-erro-avaliacao">
                        {erros.descricao}
                    </small>
                )}

            </div>


            {/* PERÍODO */}

            <div className="campos-periodo-avaliacao">

                <div className="campo-avaliacao">

                    <label htmlFor="data-inicio-avaliacao">
                        Data de início <span>*</span>
                    </label>

                    <input
                        id="data-inicio-avaliacao"
                        type="date"
                        value={dataInicio}
                        onChange={(evento) => {
                            setDataInicio(evento.target.value);
                            limparErro('dataInicio');
                        }}
                        className={erros.dataInicio ? 'campo-avaliacao-erro' : ''}
                    />

                    {erros.dataInicio && (
                        <small className="mensagem-erro-avaliacao">
                            {erros.dataInicio}
                        </small>
                    )}

                </div>


                <div className="campo-avaliacao">

                    <label htmlFor="data-fim-avaliacao">
                        Data de encerramento <span>*</span>
                    </label>

                    <input
                        id="data-fim-avaliacao"
                        type="date"
                        min={dataInicio || undefined}
                        value={dataFim}
                        onChange={(evento) => {
                            setDataFim(evento.target.value);
                            limparErro('dataFim');
                        }}
                        className={erros.dataFim ? 'campo-avaliacao-erro' : ''}
                    />

                    {erros.dataFim && (
                        <small className="mensagem-erro-avaliacao">
                            {erros.dataFim}
                        </small>
                    )}

                </div>

            </div>


            {/* ANONIMATO */}

            <div className="campo-anonimato-avaliacao">

                <div className="texto-anonimato-avaliacao">

                    <strong>Respostas anônimas</strong>

                    <p>
                        Quando habilitado, as respostas individuais não devem ser identificadas.
                    </p>

                </div>

                <label className="alternancia-anonimato-avaliacao">

                    <input
                        type="checkbox"
                        checked={Number(anonimato) === 1}
                        onChange={(evento) => {
                            setAnonimato(evento.target.checked ? 1 : 0);
                        }}
                    />

                    <span className="controle-alternancia-avaliacao"></span>

                </label>

            </div>

        </div>

    );

}

export default IdentificacaoAvaliacao;
