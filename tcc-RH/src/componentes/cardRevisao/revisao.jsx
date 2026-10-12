//----------------- IMPORTAÇÕES ----------------------------//

import '../cardRevisao/revisao.css';


//----------------- COMPONENTE -----------------------------//

function Revisao({
    nome,
    codigo,
    descricao,
    status,
    responsavel,
    colaboradores = [],
    nomeValido,
    codigoValido,
    nomeDuplicado,
    codigoDuplicado,
    erro,
    sucesso
}) {

    //----------------- VALIDAÇÕES --------------------------//

    const nomeAprovado = nomeValido && !nomeDuplicado;
    const codigoAprovado = codigoValido && !codigoDuplicado;


    //----------------- RESPONSÁVEL -------------------------//

    const colaboradorResponsavel = colaboradores.find(
        (item) => String(item.id) === String(responsavel)
    );


    //----------------- RETORNO JSX -------------------------//

    return (

        <section className="cartao-revisao">

            {/* CABEÇALHO */}

            <div className="cabecalho-revisao">

                <h2>Revise as informações antes de salvar</h2>

                <span className="etiqueta-revisao">
                    Espelho de cadastro
                </span>

            </div>


            {/* RESUMO DO CADASTRO */}

            <div className="resumo-cadastro">

                {/* COLUNA ESQUERDA */}

                <div className="coluna-resumo">

                    <div className="item-resumo">

                        <span>Nome do setor</span>

                        <strong>
                            {nome || 'Não informado'}
                        </strong>

                    </div>


                    <div className="item-resumo">

                        <span>Status inicial</span>

                        <strong>

                            <span
                                className={`etiqueta-status ${
                                    status === 1
                                        ? 'status-ativo'
                                        : 'status-inativo'
                                }`}
                            >
                                ● {status === 1 ? 'Ativo' : 'Inativo'}
                            </span>

                        </strong>

                    </div>


                    <div className="item-resumo">

                        <span>Descrição</span>

                        <p>
                            {descricao || 'Nenhuma descrição informada.'}
                        </p>

                    </div>

                </div>


                {/* COLUNA DIREITA */}

                <div className="coluna-resumo">

                    <div className="item-resumo">

                        <span>Código de referência</span>

                        <strong>
                            {codigo || 'Não informado'}
                        </strong>

                    </div>


                    <div className="item-resumo">

                        <span>Responsável pelo setor</span>

                        <strong>
                            {colaboradorResponsavel?.nome || 'Não definido'}
                        </strong>

                    </div>

                </div>

            </div>


            {/* VALIDAÇÕES */}

            <div className="lista-validacoes">

                <span className={nomeAprovado ? 'validacao-aprovada' : 'validacao-pendente'}>
                    {nomeAprovado ? '✓' : '○'} Nome único validado
                </span>

                <span className={codigoAprovado ? 'validacao-aprovada' : 'validacao-pendente'}>
                    {codigoAprovado ? '✓' : '○'} Formato do código
                </span>

                <span className="validacao-aprovada">
                    ✓ Status operacional definido
                </span>

            </div>


            {/* MENSAGENS */}

            {erro && (

                <p className="mensagem-erro">
                    {erro}
                </p>

            )}

            {sucesso && (

                <p className="mensagem-sucesso">
                    {sucesso}
                </p>

            )}

        </section>

    );
}


//----------------- EXPORTAÇÃO -----------------------------//

export default Revisao;