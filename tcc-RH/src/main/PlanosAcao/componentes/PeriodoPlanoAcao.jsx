
import { useEffect, useRef, useState } from 'react';

import calendarioInicioIcone from '../../../img/calendarioInicio-icon.svg';
import calendarioFimIcone from '../../../img/calendarioFim-icon.svg';

import '../css-componentes/periodoPlanoAcao.css';

/* =========================================================
   FORMATAR DATA PARA EXIBIÇÃO
========================================================= */

function formatarDataParaTela(data) {
    if (!data) return '';

    const valor = String(data).split('T')[0];

    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        const [ano, mes, dia] = valor.split('-');

        return `${dia}/${mes}/${ano}`;
    }

    return valor;
}

/* =========================================================
   FORMATAR DATA DIGITADA
========================================================= */

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

/* =========================================================
   CONVERTER DATA PARA O BANCO
========================================================= */

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

    return (
        `${ano}-` +
        `${String(mes).padStart(2, '0')}-` +
        `${String(dia).padStart(2, '0')}`
    );
}

/* =========================================================
   CAMPO DE DATA DIGITÁVEL
========================================================= */

function useDataDigitada(dataBanco, alterarData) {
    const [dataTela, setDataTela] = useState(
        formatarDataParaTela(dataBanco)
    );

    const ultimaDataEnviadaRef = useRef(dataBanco || '');

    useEffect(() => {
        const valorAtual = dataBanco || '';

        if (valorAtual !== ultimaDataEnviadaRef.current) {
            ultimaDataEnviadaRef.current = valorAtual;

            setDataTela(formatarDataParaTela(valorAtual));
        }
    }, [dataBanco]);

    function aoDigitarData(evento) {
        const numeros = evento.target.value
            .replace(/\D/g, '')
            .slice(0, 8);

        setDataTela(formatarDataDigitada(numeros));

        const dataConvertida = converterDataParaBanco(numeros);

        // Envia somente uma data completa e válida.
        if (dataConvertida) {
            ultimaDataEnviadaRef.current = dataConvertida;
            alterarData(dataConvertida);
            return;
        }

        // Limpa a data anterior enquanto estiver sendo editada.
        if (numeros.length === 0 || dataBanco) {
            ultimaDataEnviadaRef.current = '';
            alterarData('');
        }
    }

    return {
        dataTela,
        aoDigitarData
    };
}

/* =========================================================
   PERÍODO DO PLANO DE AÇÃO
========================================================= */

function PeriodoPlanoAcao({
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim
}) {
    const inicio = useDataDigitada(
        dataInicio,
        setDataInicio
    );

    const fim = useDataDigitada(
        dataFim,
        setDataFim
    );

    return (
        <div className="campos-periodo-plano-acao">

            {/* DATA DE INÍCIO */}
            <div className="campo-periodo-plano-acao">
                <label htmlFor="data-inicio-plano">
                    Data de início
                    <span className="obrigatorio">*</span>
                </label>

                <div className="input-data-plano-acao">
                    <img
                        src={calendarioInicioIcone}
                        alt="Calendário"
                    />

                    <input
                        id="data-inicio-plano"
                        type="text"
                        value={inicio.dataTela}
                        onChange={inicio.aoDigitarData}
                        placeholder="EX: 20/01/2026"
                        maxLength={10}
                        inputMode="numeric"
                        autoComplete="off"
                    />
                </div>
            </div>

            {/* DATA DE TÉRMINO */}
            <div className="campo-periodo-plano-acao">
                <label htmlFor="data-fim-plano">
                    Data de término
                    <span className="obrigatorio">*</span>
                </label>

                <div className="input-data-plano-acao">
                    <img
                        src={calendarioFimIcone}
                        alt="Calendário"
                    />

                    <input
                        id="data-fim-plano"
                        type="text"
                        value={fim.dataTela}
                        onChange={fim.aoDigitarData}
                        placeholder="EX: 20/02/2026"
                        maxLength={10}
                        inputMode="numeric"
                        autoComplete="off"
                    />
                </div>
            </div>

        </div>
    );
}

export default PeriodoPlanoAcao;
