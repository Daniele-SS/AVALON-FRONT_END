
import { useEffect, useRef, useState } from 'react';

import ampulhetaIcone from '../../img/ampulheta-icon.svg';
import calendarioInicioIcone from '../../img/calendarioInicio-icon.svg';
import calendarioFimIcone from '../../img/calendarioFim-icon.svg';

/* =========================================================
   FORMATAÇÃO DE DATA
========================================================= */

// Converte a data do banco para DD/MM/AAAA
function formatarDataParaTela(data) {
    if (!data) return '';

    const valor = String(data).split('T')[0];

    // Data no formato AAAA-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        const [ano, mes, dia] = valor.split('-');

        return `${dia}/${mes}/${ano}`;
    }

    return valor;
}

// Formata a digitação como DD/MM/AAAA
function formatarDataDigitada(valor) {
    const numeros = String(valor || '')
        .replace(/\D/g, '')
        .slice(0, 8);

    if (numeros.length <= 2) {
        return numeros;
    }

    if (numeros.length <= 4) {
        return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }

    return (
        `${numeros.slice(0, 2)}/` +
        `${numeros.slice(2, 4)}/` +
        `${numeros.slice(4, 8)}`
    );
}

// Converte DD/MM/AAAA para AAAA-MM-DD
// Retorna vazio quando a data ainda está incompleta ou inválida
function converterDataParaBanco(valor) {
    const numeros = String(valor || '').replace(/\D/g, '');

    if (numeros.length !== 8) {
        return '';
    }

    const dia = Number(numeros.slice(0, 2));
    const mes = Number(numeros.slice(2, 4));
    const ano = Number(numeros.slice(4, 8));

    if (ano < 1000 || ano > 9999) {
        return '';
    }

    if (mes < 1 || mes > 12) {
        return '';
    }

    const ultimoDia = new Date(ano, mes, 0).getDate();

    if (dia < 1 || dia > ultimoDia) {
        return '';
    }

    const diaFormatado = String(dia).padStart(2, '0');
    const mesFormatado = String(mes).padStart(2, '0');

    return `${ano}-${mesFormatado}-${diaFormatado}`;
}

/* =========================================================
   CAMPO DE DATA COM DIGITAÇÃO CONTÍNUA
========================================================= */

function useDataDigitada(dataBanco, alterarData) {
    const [dataTela, setDataTela] = useState(
        formatarDataParaTela(dataBanco)
    );

    const ultimaDataEnviadaRef = useRef(dataBanco || '');

    // Atualiza o campo quando a data vem de fora,
    // por exemplo, ao abrir uma edição.
    useEffect(() => {
        const valorAtual = dataBanco || '';

        if (valorAtual !== ultimaDataEnviadaRef.current) {
            ultimaDataEnviadaRef.current = valorAtual;

            setDataTela(formatarDataParaTela(valorAtual));
        }
    }, [dataBanco]);

    function aoDigitarData(evento) {
        const valorDigitado = evento.target.value;
        const numeros = valorDigitado.replace(/\D/g, '').slice(0, 8);

        const dataFormatada = formatarDataDigitada(numeros);

        setDataTela(dataFormatada);

        const dataConvertida = converterDataParaBanco(numeros);

        // Envia a data para o componente pai somente
        // quando estiver completa e válida.
        if (dataConvertida) {
            ultimaDataEnviadaRef.current = dataConvertida;

            alterarData({
                target: {
                    value: dataConvertida
                }
            });

            return;
        }

        // Se a data foi apagada ou está sendo editada,
        // limpa o valor anterior no componente pai.
        if (numeros.length === 0 || dataBanco) {
            ultimaDataEnviadaRef.current = '';

            alterarData({
                target: {
                    value: ''
                }
            });
        }
    }

    return {
        dataTela,
        aoDigitarData
    };
}

/* =========================================================
   PERÍODO DE FÉRIAS
========================================================= */

function PeriodoFerias({
    dataInicio,
    dataFim,
    dataMinima,
    quantidadeDias,
    saldoDisponivel,
    LIMITE_ANUAL_FERIAS,
    erros = {},
    alterarDataInicio,
    alterarDataFim
}) {
    const inicio = useDataDigitada(
        dataInicio,
        alterarDataInicio
    );

    const fim = useDataDigitada(
        dataFim,
        alterarDataFim
    );

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

                {/* DATA DE INÍCIO */}
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
                            alt="Calendário"
                        />

                        <input
                            id="data-inicio-ferias"
                            type="text"
                            value={inicio.dataTela}
                            onChange={inicio.aoDigitarData}
                            placeholder="EX: 20/01/2026"
                            maxLength={10}
                            inputMode="numeric"
                            autoComplete="off"
                            aria-invalid={Boolean(erros.dataInicio)}
                        />
                    </div>

                    {erros.dataInicio && (
                        <small className="mensagem-erro-ferias">
                            {erros.dataInicio}
                        </small>
                    )}
                </div>

                {/* DATA DE TÉRMINO */}
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
                            alt="Calendário"
                        />

                        <input
                            id="data-fim-ferias"
                            type="text"
                            value={fim.dataTela}
                            onChange={fim.aoDigitarData}
                            placeholder="EX: 20/02/2026"
                            maxLength={10}
                            inputMode="numeric"
                            autoComplete="off"
                            aria-invalid={Boolean(erros.dataFim)}
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

            {/* RESUMO DO PERÍODO */}
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
