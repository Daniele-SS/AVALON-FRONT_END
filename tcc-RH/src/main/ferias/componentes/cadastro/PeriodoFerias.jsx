import ampulhetaIcone from '../../img/ampulheta-icon.svg';
import calendarioInicioIcone from '../../img/calendarioInicio-icon.svg';
import calendarioFimIcone from '../../img/calendarioFim-icon.svg';
function PeriodoFerias({
    dataInicio,
    dataFim,
    dataMinima,
    quantidadeDias,
    saldoDisponivel,
    LIMITE_ANUAL_FERIAS,
    erros,
    alterarDataInicio,
    alterarDataFim
}) {
    return (
        <section className="cartao-cadastro-ferias">

            <div className="cabecalho-card-ferias">
                <div>
                    <h2>
                        Período de Férias
                    </h2>

                    <p>
                        Definição do intervalo de gozo e duração
                    </p>
                </div>
            </div>

            <div className="campos-periodo-ferias">

                <div className="campo-ferias">
                    <label htmlFor="data-inicio-ferias">
                        Data de início
                        <span className="obrigatorio">*</span>
                    </label>

                    <div
                        className={`input-data-ferias ${
                            erros.dataInicio
                                ? 'input-ferias-erro'
                                : ''
                        }`}
                    >
                        <img
                            src={calendarioInicioIcone}
                            alt="Calendario"
                        />

                        <input
                            id="data-inicio-ferias"
                            type="date"
                            value={dataInicio}
                            min={dataMinima}
                            onChange={alterarDataInicio}
                            aria-invalid={
                                Boolean(erros.dataInicio)
                            }
                        />
                    </div>

                    {erros.dataInicio && (
                        <small className="mensagem-erro-ferias">
                            {erros.dataInicio}
                        </small>
                    )}
                </div>

                <div className="campo-ferias">
                    <label htmlFor="data-fim-ferias">
                        Data de término
                        <span className="obrigatorio">*</span>
                    </label>

                    <div
                        className={`input-data-ferias ${
                            erros.dataFim
                                ? 'input-ferias-erro'
                                : ''
                        }`}
                    >
                        <img
                            src={calendarioFimIcone}
                            alt="Calendario"
                        />

                        <input
                            id="data-fim-ferias"
                            type="date"
                            value={dataFim}
                            min={
                                dataInicio ||
                                dataMinima
                            }
                            onChange={alterarDataFim}
                            aria-invalid={
                                Boolean(erros.dataFim)
                            }
                        />
                    </div>

                    {erros.dataFim && (
                        <small className="mensagem-erro-ferias">
                            {erros.dataFim}
                        </small>
                    )}
                </div>

            </div>

            {erros.periodo && (
                <div className="erro-periodo-ferias">
                    {erros.periodo}
                </div>
            )}

            <div
                className={`resumo-ferias ${
                    saldoDisponivel === 0
                        ? 'saldo-esgotado-ferias'
                        : ''
                }`}
            >
                <div className="icone-resumo-ferias">
                    <img
                        src={ampulhetaIcone}
                        alt="Ampulheta"
                    />
                </div>

                <div className="texto-resumo-ferias">
                    <strong>
                        {quantidadeDias}
                        <span>
                            {' '}dias de férias calculados
                        </span>
                    </strong>

                    <small>
                        ✓ Saldo disponível:
                        <b>
                            {' '}{saldoDisponivel}{' '}dias
                        </b>
                    </small>
                </div>

                <div className="limite-anual-ferias">
                    <span>
                        Férias anuais
                    </span>

                    <strong>
                        {LIMITE_ANUAL_FERIAS}{' '}dias
                    </strong>

                    <small>
                        Utilizado:{' '}
                        {quantidadeDias}{' '}dias
                    </small>
                </div>
            </div>

        </section>
    );
}

export default PeriodoFerias;