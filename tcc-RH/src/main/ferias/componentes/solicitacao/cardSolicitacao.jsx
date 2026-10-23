
import './cardSolicitacao.css';

import SolicitacaoIcone from '../../img/solicitcao-icon.svg';
import AnalisarIcone from '../../img/analisar-icon.svg';


// ======================================================
// COMPONENTE REUTILIZÁVEL
// ======================================================

function CardSolicitacao({
    solicitacoes = [],
    onAnalisar,
    onVerTodas
}) {

    // Quantidade total de solicitações recebidas
    const quantidadeSolicitacoes = solicitacoes.length;


    // ==================================================
    // GERAR INICIAIS DO FUNCIONÁRIO
    // ==================================================

    function gerarIniciais(nome) {

        if (!nome) {
            return '??';
        }

        const partesNome = nome.trim().split(/\s+/);

        if (partesNome.length === 1) {
            return partesNome[0].substring(0, 2).toUpperCase();
        }

        return (
            partesNome[0][0] +
            partesNome[partesNome.length - 1][0]
        ).toUpperCase();
    }


    // ==================================================
    // EXIBIR SOMENTE DOIS PEDIDOS NO CARD
    // ==================================================

    const pedidosExibidos = solicitacoes.slice(0, 2);


    // ==================================================
    // RETORNO
    // ==================================================

    return (
        <div className="card-solicitacao">

            {/* CABEÇALHO */}

            <div className="cabecalho-card">

                <div className="introducao">

                    <div className="icone">

                        <img
                            src={SolicitacaoIcone}
                            alt="Ícone de solicitação"
                        />

                    </div>

                    <div className="nomes">

                        <h2>
                            Solicitações aguardando análise
                        </h2>

                        <p>
                            {quantidadeSolicitacoes}{' '}
                            {quantidadeSolicitacoes === 1
                                ? 'solicitação pendente requer'
                                : 'solicitações pendentes requerem'
                            } verificação de escala e deferimento formal
                        </p>

                    </div>

                </div>


                {/* BOTÃO VER TODAS */}

                <button
                    className="ver-tudo"
                    type="button"
                    onClick={onVerTodas}
                >
                    Ver todas as {quantidadeSolicitacoes} pendências →
                </button>

            </div>


            {/* CARDS DOS PEDIDOS */}

            <div className="card-pedidos">

                <div className="lista-pedidos">

                    {pedidosExibidos.map((solicitacao) => (

                        <div
                            className="pedido"
                            key={solicitacao.id}
                        >

                            {/* DADOS DO FUNCIONÁRIO */}

                            <div className="pedido-topo">

                                <div className="colaborador">

                                    {/* FOTO OU INICIAIS */}

                                    <div className="avatar">

                                        {solicitacao.foto ? (

                                            <img
                                                src={solicitacao.foto}
                                                alt={`Foto de ${solicitacao.nome}`}
                                            />

                                        ) : (

                                            gerarIniciais(solicitacao.nome)

                                        )}

                                    </div>


                                    {/* NOME E IDENTIFICAÇÃO */}

                                    <div className="dados-colaborador">

                                        <div className="nome">

                                            {solicitacao.nome}

                                            <span>
                                                #{solicitacao.codigo}
                                            </span>

                                        </div>

                                        <div className="subtitulo">

                                            Setor: {solicitacao.setor}
                                            {' • '}
                                            {solicitacao.gestorCargo || 'Gestor'}
                                            {': '}
                                            {solicitacao.gestor}

                                        </div>

                                    </div>

                                </div>


                                {/* STATUS */}

                                <div className="status">

                                    <span></span>

                                    {solicitacao.status || 'Pendente de análise'}

                                </div>

                            </div>


                            {/* INFORMAÇÕES DO PEDIDO */}

                            <div className="pedido-info">

                                <div className="info">

                                    <label>
                                        Período Solicitado:
                                    </label>

                                    <strong>
                                        {solicitacao.periodo}
                                    </strong>

                                </div>


                                <div className="info">

                                    <label>
                                        Duração:
                                    </label>

                                    <strong>
                                        {solicitacao.duracao} dias
                                    </strong>

                                </div>

                            </div>


                            {/* BOTÃO ANALISAR */}

                            <div className="pedido-footer">

                                <button
                                    className="btn-analisar"
                                    type="button"
                                    onClick={() => onAnalisar?.(solicitacao)}
                                >
                                    Analisar solicitação

                                    <img
                                        src={AnalisarIcone}
                                        alt=""
                                    />

                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );

}

export default CardSolicitacao;
