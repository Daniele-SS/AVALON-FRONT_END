
import './css-componentes/cardSolicitacao.css';

function obterColaborador(ferias) {
    return Array.isArray(ferias.colaborador)
        ? ferias.colaborador[0] || {}
        : ferias.colaborador || {};
}

function obterNomeColaborador(ferias) {
    const colaborador = obterColaborador(ferias);

    return (
        colaborador.nome ||
        colaborador.nome_completo ||
        colaborador.nome_colaborador ||
        'Colaborador'
    );
}

function formatarData(data) {
    if (!data) return '--/--/----';

    const dataTexto = String(data).slice(0, 10);
    const partes = dataTexto.split('-');

    if (partes.length !== 3) return dataTexto;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function CardSolicitacao({ solicitacao, onAnalisar }) {
    return (
        <article className="solicitacao-card">
            <div className="solicitacao-card-cabecalho">
                <div className="solicitacao-card-colaborador">
                    <div className="solicitacao-avatar">
                        {obterNomeColaborador(solicitacao).charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h3>{obterNomeColaborador(solicitacao)}</h3>
                        <span>Solicitação de férias</span>
                    </div>
                </div>

                <span className="solicitacao-status-pendente">
                    Pendente
                </span>
            </div>

            <div className="solicitacao-card-periodo">
                <div>
                    <span>Data de início</span>
                    <strong>{formatarData(solicitacao.data_inicio)}</strong>
                </div>

                <div>
                    <span>Data de término</span>
                    <strong>{formatarData(solicitacao.data_fim)}</strong>
                </div>

                <div>
                    <span>Duração</span>
                    <strong>
                        {solicitacao.quantidade_dias || 0} dias
                    </strong>
                </div>
            </div>

            {solicitacao.observacao && (
                <div className="solicitacao-card-observacao">
                    <span>Observação do colaborador</span>
                    <p>{solicitacao.observacao}</p>
                </div>
            )}

            <div className="solicitacao-card-rodape">
                <button
                    type="button"
                    className="solicitacao-botao-analisar"
                    onClick={() => onAnalisar(solicitacao)}
                >
                    Analisar solicitação
                </button>
            </div>
        </article>
    );
}

export default CardSolicitacao;
