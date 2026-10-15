//----------------- IMPORTAÇÕES -----------------------------//

import '../cardRevisao/revisao.css';


//----------------- COMPONENTE ------------------------------//

function Revisao({
    nome,
    codigo,
    descricao,
    status,
    responsavel,
    colaboradores = [],

    tituloNome = 'Nome',
    tituloCodigo = 'Código de referência',
    tituloResponsavel = 'Responsável',

    mostrarCodigo = true,
    mostrarResponsavel = true,
    mostrarDescricao = true,

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

                {/* NOME */}

                <div className="item-resumo">

                    <span>{tituloNome}</span>

                    <strong>
                        {nome || 'Não informado'}
                    </strong>

                </div>


                {/* CÓDIGO */}

                {mostrarCodigo && (

                    <div className="item-resumo">

                        <span>{tituloCodigo}</span>

                        <strong>
                            {codigo || 'Não informado'}
                        </strong>

                    </div>

                )}


                {/* DESCRIÇÃO */}

                {mostrarDescricao && (

                    <div className="item-resumo">

                        <span>Descrição</span>

                        <p>
                            {descricao || 'Nenhuma descrição informada.'}
                        </p>

                    </div>

                )}


                {/* STATUS */}

                <div className="item-resumo">

                    <span>Status inicial</span>

                    <strong>

                        <span
                            className={`etiqueta-status ${Number(status) === 1
                                    ? 'status-ativo'
                                    : 'status-inativo'
                                }`}
                        >
                            ● {Number(status) === 1 ? 'Ativo' : 'Inativo'}
                        </span>

                    </strong>

                </div>


                {/* RESPONSÁVEL */}

                {mostrarResponsavel && (

                    <div className="item-resumo">

                        <span>{tituloResponsavel}</span>

                        <strong>
                            {colaboradorResponsavel?.nome || 'Não definido'}
                        </strong>

                    </div>

                )}

            </div>


            {/* VALIDAÇÕES */}

            <div className="lista-validacoes">

                <span
                    className={
                        nomeAprovado
                            ? 'validacao-aprovada'
                            : 'validacao-pendente'
                    }
                >
                    {nomeAprovado ? '✓' : '○'} Nome único validado
                </span>


                {mostrarCodigo && (

                    <span
                        className={
                            codigoAprovado
                                ? 'validacao-aprovada'
                                : 'validacao-pendente'
                        }
                    >
                        {codigoAprovado ? '✓' : '○'} Formato do código
                    </span>

                )}


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