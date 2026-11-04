
//----------------- IMPORTAÇÕES -----------------------------//

import './cardBeneficio.css';


//----------------- COMPONENTE ------------------------------//

function CardBeneficio({ beneficio, onVerDetalhes }) {

    // Verifica se o benefício está ativo.
    const beneficioAtivo = Number(beneficio.status) === 1;

    // Define o texto da disponibilidade.
    function obterDisponibilidade(disponibilidade) {

        if (disponibilidade === 'TODOS') {
            return 'Todos os colaboradores';
        }

        if (disponibilidade === 'SETOR') {
            return 'Por setor';
        }

        if (disponibilidade === 'CARGO') {
            return 'Por cargo';
        }

        return 'Não informado';
    }

    // Quantidade e percentual de adesão.
    const quantidadeColaboradores =
        beneficio.quantidade_colaboradores || 0;

    const percentualAdesao =
        beneficio.percentual_adesao || 0;

    // Lista de colaboradores vinculados ao benefício.
    const colaboradoresVinculados =
        Array.isArray(beneficio.colaboradores_vinculados)
            ? beneficio.colaboradores_vinculados
            : [];

    //----------------- EXIBIÇÃO ------------------------------//

    return (

        <article className="card-beneficio">

            {/* Cabeçalho do benefício */}

            <div className="cabecalho-card-beneficio">

                <h2 className="nome-card-beneficio">
                    {beneficio.nome}
                </h2>

                <span
                    className={
                        beneficioAtivo
                            ? 'status-card-beneficio ativo'
                            : 'status-card-beneficio inativo'
                    }
                >
                    <span className="ponto-status-beneficio"></span>

                    {beneficioAtivo ? 'Ativo' : 'Inativo'}
                </span>

            </div>


            {/* Descrição do benefício */}

            <p className="descricao-card-beneficio">
                {beneficio.descricao ||
                    'Nenhuma descrição informada.'}
            </p>


            {/* Informações dos colaboradores */}

            <div className="informacoes-card-beneficio">

                <div className="linha-colaboradores-beneficio">

                    <span>
                        Colaboradores vinculados
                    </span>

                    <strong>
                        {quantidadeColaboradores}
                    </strong>

                </div>


                {/* Barra de adesão corporativa */}

                <div
                    className="barra-progresso-beneficio"
                    role="progressbar"
                    aria-label="Adesão corporativa"
                    aria-valuenow={percentualAdesao}
                    aria-valuemin="0"
                    aria-valuemax="100"
                >

                    <div
                        className="progresso-beneficio"
                        style={{
                            width: `${Math.min(
                                100,
                                Math.max(0, percentualAdesao)
                            )}%`
                        }}
                    ></div>

                </div>


                <div className="rodape-informacoes-beneficio">

                    <span>
                        Adesão corporativa:
                    </span>

                    <strong>
                        {percentualAdesao}%
                    </strong>

                </div>

            </div>


            {/* Disponibilidade e botão Ver detalhes */}

            <div className="rodape-card-beneficio">

                <div className="disponibilidade-card-beneficio">

                    <span className="titulo-disponibilidade-beneficio">
                        Disponibilidade
                    </span>

                    <span className="valor-disponibilidade-beneficio">
                        {obterDisponibilidade(beneficio.disponibilidade)}
                    </span>

                </div>

                <button
                    type="button"
                    className="botao-ver-detalhes-beneficio"
                    onClick={() => onVerDetalhes(beneficio)}
                >
                    Ver detalhes
                </button>

            </div>

        </article>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CardBeneficio;
