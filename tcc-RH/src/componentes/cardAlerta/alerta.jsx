//----------------- IMPORTAÇÕES -----------------------------//

import './alerta.css';


//----------------- COMPONENTE ------------------------------//

function Alerta({
    aberto,
    titulo = 'Inativar registro?',
    entidade = 'registro',
    mensagem = 'Tem certeza de que deseja inativar este registro?',
    informacoes = [],
    textoBotao = 'Inativar',
    carregando = false,
    cancelar,
    confirmar
}) {

    //----------------- VERIFICAR VISIBILIDADE --------------//

    if (!aberto) {
        return null;
    }


    //----------------- TELA --------------------------------//

    return (

        <div className="fundo-alerta">

            <div
                className="card-alerta"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-alerta"
            >

                {/* CABEÇALHO */}

                <div className="cabecalho-alerta">

                    <div className="icone-alerta">
                        ⚠
                    </div>

                    <div className="titulo-alerta">

                        <span className="categoria-alerta">
                            ATENÇÃO E GOVERNANÇA
                        </span>

                        <h2 id="titulo-alerta">
                            {titulo}
                        </h2>

                    </div>

                    <button
                        type="button"
                        className="fechar-alerta"
                        onClick={cancelar}
                        disabled={carregando}
                        aria-label="Fechar alerta"
                    >
                        ×
                    </button>

                </div>


                {/* MENSAGEM */}

                <p className="mensagem-alerta">
                    {mensagem}
                </p>


                {/* INFORMAÇÕES CONFIGURÁVEIS */}

                {informacoes.length > 0 && (

                    <div className="informacoes-alerta">

                        {informacoes.map((informacao, indice) => (

                            <div
                                className={`linha-alerta ${informacao.tipo || ''}`}
                                key={`${informacao.titulo}-${indice}`}
                            >

                                {/* ÍCONE */}

                                {informacao.icone && (

                                    <span className="icone-informacao-alerta">
                                        {informacao.icone}
                                    </span>

                                )}


                                {/* TÍTULO DA INFORMAÇÃO */}

                                <span className="nome-informacao-alerta">
                                    {informacao.titulo}
                                </span>


                                {/* COLABORADORES */}

                                {informacao.tipo === 'colaboradores' ? (

                                    <span className="caixa-colaboradores">

                                        <strong className="numero-colaboradores">
                                            {informacao.valor}
                                        </strong>

                                        <span className="texto-vinculados">
                                            vinculados
                                        </span>

                                    </span>

                                ) : informacao.tipo === 'integridade' ? (

                                    /* POLÍTICA DE INTEGRIDADE */

                                    <span className="valor-informacao-alerta">

                                        O {entidade}{' '}

                                        <strong className="texto-nao">
                                            não
                                        </strong>

                                        {' '}será excluído. Seu histórico será preservado.

                                    </span>

                                ) : (

                                    /* OUTRAS INFORMAÇÕES */

                                    <strong className="valor-informacao-alerta">
                                        {informacao.valor}
                                    </strong>

                                )}


                                {/* DESCRIÇÃO OPCIONAL */}

                                {informacao.descricao && (

                                    <p className="descricao-informacao-alerta">
                                        {informacao.descricao}
                                    </p>

                                )}

                            </div>

                        ))}

                    </div>

                )}


                {/* BOTÕES */}

                <div className="botoes-alerta">

                    <button
                        type="button"
                        className="botao-cancelar-alerta"
                        onClick={cancelar}
                        disabled={carregando}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="botao-confirmar-alerta"
                        onClick={confirmar}
                        disabled={carregando}
                    >

                        {carregando
                            ? 'Inativando...'
                            : `⏻ ${textoBotao} ${entidade}`
                        }

                    </button>

                </div>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Alerta;