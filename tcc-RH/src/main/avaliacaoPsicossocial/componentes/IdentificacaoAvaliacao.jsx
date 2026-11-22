import { useState } from 'react';

import './css-componentes/identificacaoAvaliacao.css';

//----------------- FUNÇÕES DE DATA --------------------------//

// Formata a data para aparecer na tela como DD/MM/AAAA.
function formatarDataParaTela(data) {
    if (!data) return '';

    const valor = String(data).split('T')[0];

    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        const [ano, mes, dia] = valor.split('-');

        return `${dia}/${mes}/${ano}`;
    }

    return valor;
}


// Insere as barras automaticamente enquanto o usuário digita.
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

    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
}


// Converte DD/MM/AAAA para AAAA-MM-DD.
// Também verifica se a data realmente existe.
function converterDataParaBanco(valor) {
    const numeros = String(valor || '').replace(/\D/g, '');

    if (numeros.length !== 8) {
        return '';
    }

    const dia = Number(numeros.slice(0, 2));
    const mes = Number(numeros.slice(2, 4));
    const ano = Number(numeros.slice(4, 8));

    if (ano < 1000 || ano > 9999 || mes < 1 || mes > 12) {
        return '';
    }

    const ultimoDia = new Date(ano, mes, 0).getDate();

    if (dia < 1 || dia > ultimoDia) {
        return '';
    }

    return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}


//----------------- IDENTIFICAÇÃO DA AVALIAÇÃO ---------------//

function IdentificacaoAvaliacao({
    titulo,
    setTitulo,
    descricao,
    setDescricao,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    anonimato,
    setAnonimato,
    erros,
    limparErro
}) {

    // Datas exibidas no formato DD/MM/AAAA.
    const [dataInicioTela, setDataInicioTela] = useState(
        () => formatarDataParaTela(dataInicio)
    );

    const [dataFimTela, setDataFimTela] = useState(
        () => formatarDataParaTela(dataFim)
    );


    // Atualiza a data de início.
    function alterarDataInicio(valor) {
        const dataFormatada = formatarDataDigitada(valor);

        setDataInicioTela(dataFormatada);

        // O componente pai recebe a data no formato AAAA-MM-DD.
        setDataInicio(converterDataParaBanco(dataFormatada));

        limparErro('dataInicio');
    }


    // Atualiza a data de encerramento.
    function alterarDataFim(valor) {
        const dataFormatada = formatarDataDigitada(valor);

        setDataFimTela(dataFormatada);

        // O componente pai recebe a data no formato AAAA-MM-DD.
        setDataFim(converterDataParaBanco(dataFormatada));

        limparErro('dataFim');
    }


    return (

        <div className="cartao-identificacao-avaliacao">


            {/* TÍTULO */}

            <div className="campo-avaliacao">

                <div className="rotulo-campo-avaliacao">

                    <label htmlFor="titulo-avaliacao">
                        Título da avaliação <span>*</span>
                    </label>

                    <small>{titulo.length} / 100</small>

                </div>

                <input
                    id="titulo-avaliacao"
                    type="text"
                    placeholder="Ex: Avaliação Psicossocial - 2026"
                    maxLength={100}
                    value={titulo}
                    onChange={(evento) => {
                        setTitulo(evento.target.value);
                        limparErro('titulo');
                    }}
                    className={erros.titulo ? 'campo-avaliacao-erro' : ''}
                />

                {erros.titulo && (
                    <small className="mensagem-erro-avaliacao">
                        {erros.titulo}
                    </small>
                )}

            </div>


            {/* DESCRIÇÃO */}

            <div className="campo-avaliacao">

                <div className="rotulo-campo-avaliacao">

                    <label htmlFor="descricao-avaliacao">
                        Descrição da avaliação
                    </label>

                    <small>{descricao.length} / 255</small>

                </div>

                <textarea
                    id="descricao-avaliacao"
                    placeholder="Descreva o objetivo desta avaliação."
                    maxLength={255}
                    value={descricao}
                    onChange={(evento) => {
                        setDescricao(evento.target.value);
                        limparErro('descricao');
                    }}
                    className={erros.descricao ? 'campo-avaliacao-erro' : ''}
                />

                {erros.descricao && (
                    <small className="mensagem-erro-avaliacao">
                        {erros.descricao}
                    </small>
                )}

            </div>


            {/* PERÍODO */}

            <div className="campos-periodo-avaliacao">

                {/* DATA DE INÍCIO */}

                <div className="campo-avaliacao">

                    <label htmlFor="data-inicio-avaliacao">
                        Data de início <span>*</span>
                    </label>

                    <input
                        id="data-inicio-avaliacao"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        value={dataInicioTela}
                        onChange={(evento) => {
                            alterarDataInicio(evento.target.value);
                        }}
                        className={erros.dataInicio ? 'campo-avaliacao-erro' : ''}
                    />

                    {erros.dataInicio && (
                        <small className="mensagem-erro-avaliacao">
                            {erros.dataInicio}
                        </small>
                    )}

                </div>


                {/* DATA DE ENCERRAMENTO */}

                <div className="campo-avaliacao">

                    <label htmlFor="data-fim-avaliacao">
                        Data de encerramento <span>*</span>
                    </label>

                    <input
                        id="data-fim-avaliacao"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        value={dataFimTela}
                        onChange={(evento) => {
                            alterarDataFim(evento.target.value);
                        }}
                        className={erros.dataFim ? 'campo-avaliacao-erro' : ''}
                    />

                    {erros.dataFim && (
                        <small className="mensagem-erro-avaliacao">
                            {erros.dataFim}
                        </small>
                    )}

                </div>

            </div>


            {/* ANONIMATO */}

            <div className="campo-anonimato-avaliacao">

                <div className="texto-anonimato-avaliacao">

                    <strong>Respostas anônimas</strong>

                    <p>
                        Quando habilitado, as respostas individuais não devem ser identificadas.
                    </p>

                </div>

                <label className="alternancia-anonimato-avaliacao">

                    <input
                        type="checkbox"
                        checked={Number(anonimato) === 1}
                        onChange={(evento) => {
                            setAnonimato(evento.target.checked ? 1 : 0);
                        }}
                    />

                    <span className="controle-alternancia-avaliacao"></span>

                </label>

            </div>

        </div>

    );

}

export default IdentificacaoAvaliacao;