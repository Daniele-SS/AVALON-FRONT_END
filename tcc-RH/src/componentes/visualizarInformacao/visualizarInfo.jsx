
import './visualizarInfo.css';

//----------------- FORMATAR VALORES -------------------------//

// Formata os valores para evitar erros ao exibir objetos no React.
function formatarValor(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return 'Não informado';
    }

    if (typeof valor === 'boolean') {
        return valor ? 'Sim' : 'Não';
    }

    if (typeof valor === 'string' || typeof valor === 'number') {
        return String(valor);
    }

    if (Array.isArray(valor)) {
        return valor
            .map((item) => formatarValor(item))
            .join(', ');
    }

    if (typeof valor === 'object') {
        if (valor.classificacao !== undefined) {
            return formatarValor(valor.classificacao);
        }

        if (valor.nome !== undefined) {
            return formatarValor(valor.nome);
        }

        if (valor.descricao !== undefined) {
            return formatarValor(valor.descricao);
        }

        if (valor.valor !== undefined) {
            return formatarValor(valor.valor);
        }

        return 'Não informado';
    }

    return String(valor);
}

//----------------- VERIFICAR STATUS -------------------------//

// Identifica se o colaborador está ativo ou inativo.
function verificarStatus(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return 'inativo';
    }

    let status = valor;

    if (typeof status === 'object' && !Array.isArray(status)) {
        status =
            status.classificacao ??
            status.nome ??
            status.valor ??
            status.status ??
            status.descricao;
    }

    if (typeof status === 'boolean') {
        return status ? 'ativo' : 'inativo';
    }

    if (typeof status === 'number') {
        return status === 1 ? 'ativo' : 'inativo';
    }

    const statusFormatado = String(status)
        .trim()
        .toLowerCase();

    if (
        statusFormatado === 'ativo' ||
        statusFormatado === 'ativa' ||
        statusFormatado === '1' ||
        statusFormatado === 'true'
    ) {
        return 'ativo';
    }

    return 'inativo';
}

//----------------- COMPONENTE -------------------------------//

// Componente reutilizável para visualizar informações.
function VisualizarInfo({
    nome,
    foto,
    informacoes = [],
    textoBotaoDesativar = 'Desativar',
    textoBotaoEditar = 'Editar dados',
    mostrarFoto = true,
    onDesativar,
    onEditar,
    onVoltar,
    cardsDetalhes = []
}) {

    //----------------- INFORMAÇÕES PRINCIPAIS ---------------//

    // Procura as informações pelo nome.
    const informacaoCargo = informacoes.find(
        (informacao) =>
            String(informacao.nome).trim().toLowerCase() === 'cargo'
    );

    const informacaoSetor = informacoes.find(
        (informacao) =>
            String(informacao.nome).trim().toLowerCase() === 'setor'
    );

    const informacaoStatus = informacoes.find(
        (informacao) =>
            String(informacao.nome).trim().toLowerCase() === 'status'
    );

    // Define o estado visual do status.
    const status = verificarStatus(
        informacaoStatus?.valor
    );

    //----------------- RETORNO JSX ---------------------------//

    return (
        <div className="visualizar-info-pagina">

            {/* CARD PRINCIPAL: NOME, FOTO E BOTÕES */}

            <div className="card-visualizar-info">

                {/* Informações principais à esquerda */}
                <div className="visualizar-info-principal">

                    {/* Foto do colaborador */}
                    {mostrarFoto && (
                        <div className="visualizar-info-foto">

                            {foto ? (
                                <img
                                    src={foto}
                                    alt={`Foto de ${nome || 'colaborador'}`}
                                />
                            ) : (
                                <div className="visualizar-info-foto-vazia">
                                    <span>
                                        {nome
                                            ? String(nome).trim().charAt(0).toUpperCase()
                                            : '?'}
                                    </span>
                                </div>
                            )}

                        </div>
                    )}

                    {/* Nome e informações do colaborador */}
                    <div className="visualizar-info-conteudo">

                        <h2 className="visualizar-info-nome">
                            {nome || 'Nome não informado'}
                        </h2>

                        {/* Cargo, setor e status na mesma linha */}
                        <div className="visualizar-info-lista">

                            {/* Cargo */}
                            {informacaoCargo && (
                                <span className="visualizar-info-cargo">
                                    {formatarValor(informacaoCargo.valor)}
                                </span>
                            )}

                            {/* Separador entre cargo e setor */}
                            {informacaoCargo && informacaoSetor && (
                                <span className="visualizar-info-separador">
                                    •
                                </span>
                            )}

                            {/* Setor */}
                            {informacaoSetor && (
                                <span className="visualizar-info-tag">
                                    {formatarValor(informacaoSetor.valor)}
                                </span>
                            )}

                            {/* Separador antes do status */}
                            {(informacaoCargo || informacaoSetor) &&
                                informacaoStatus && (
                                    <span className="visualizar-info-separador">
                                        •
                                    </span>
                                )}

                            {/* Status */}
                            {informacaoStatus && (
                                <span
                                    className={`visualizar-info-status ${status}`}
                                >
                                    <span className="visualizar-info-status-ponto">
                                        ●
                                    </span>

                                    <span>
                                        {status === 'ativo' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </span>
                            )}

                        </div>

                    </div>

                </div>

                {/* Botões à direita */}
                <div className="visualizar-info-acoes">

                    <button
                        type="button"
                        className="visualizar-info-botao-desativar"
                        onClick={onDesativar}
                        disabled={!onDesativar}
                    >
                        {textoBotaoDesativar}
                    </button>

                    <button
                        type="button"
                        className="visualizar-info-botao-editar"
                        onClick={onEditar}
                        disabled={!onEditar}
                    >
                        {textoBotaoEditar}
                    </button>

                </div>

            </div>

            {/* CARDS INFERIORES DE DETALHES */}

            {cardsDetalhes.length > 0 && (
                <div className="visualizar-info-cards-detalhes">

                    {cardsDetalhes.map((card, indiceCard) => (
                        <section
                            key={card.id || card.titulo || indiceCard}
                            className={
                                `visualizar-info-card-detalhe ${
                                    card.ocuparLinhaToda
                                        ? 'visualizar-info-linha-toda'
                                        : ''
                                }`
                            }
                        >

                            {/* Título do card */}
                            <h3 className="visualizar-info-card-titulo">
                                {card.titulo || 'Informações'}
                            </h3>

                            {/* Campos do card */}
                            <div className="visualizar-info-card-conteudo">

                                {(card.informacoes || []).map(
                                    (informacao, indiceInformacao) => (
                                        <div
                                            key={
                                                informacao.id ||
                                                `${informacao.nome}-${indiceInformacao}`
                                            }
                                            className="visualizar-info-card-campo"
                                        >

                                            <span className="visualizar-info-card-rotulo">
                                                {informacao.nome}:
                                            </span>

                                            <span className="visualizar-info-card-valor">
                                                {formatarValor(informacao.valor)}
                                            </span>

                                        </div>
                                    )
                                )}

                                {/* Mensagem caso não existam informações */}
                                {(!card.informacoes ||
                                    card.informacoes.length === 0) && (
                                    <p className="visualizar-info-card-vazio">
                                        Nenhuma informação disponível.
                                    </p>
                                )}

                            </div>

                        </section>
                    ))}

                </div>
            )}

            {/* RODAPÉ COM BOTÃO VOLTAR */}

            <div className="visualizar-info-rodape">

                <button
                    type="button"
                    className="visualizar-info-botao-voltar"
                    onClick={onVoltar}
                >
                    Voltar
                </button>

            </div>

        </div>
    );
}

//----------------- EXPORTAÇÃO -------------------------------//

export default VisualizarInfo;
