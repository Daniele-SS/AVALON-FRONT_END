function ObservacoesFerias({
    observacao,
    alterarObservacao
}) {
    return (
        <section className="cartao-cadastro-ferias">

            <div className="cabecalho-card-ferias observacao-cabecalho-ferias">
                <div>
                    <h2>
                        Observações Internas
                    </h2>

                    <p>
                        Informações complementares e alinhamentos internos
                        (opcional)
                    </p>
                </div>

                <span className="icone-observacao-ferias">
                    ☰
                </span>
            </div>

            <div className="campo-observacao-ferias">
                <textarea
                    value={observacao}
                    onChange={alterarObservacao}
                    maxLength={300}
                    placeholder="Digite uma observação interna..."
                />
            </div>

            <div className="rodape-observacao-ferias">
                <span>
                    Visível apenas para RH, Gestão Direta e Auditoria
                </span>

                <strong>
                    {observacao.length}{' '} / 300
                </strong>
            </div>

        </section>
    );
}

export default ObservacoesFerias;