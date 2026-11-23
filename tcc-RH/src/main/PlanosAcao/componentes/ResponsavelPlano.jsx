
import { useEffect, useMemo, useRef, useState } from 'react';

import calendarioInicioIcone from '../../ferias/img/calendarioInicio-icon.svg';
import calendarioFimIcone from '../../ferias/img/calendarioFim-icon.svg';

import './css-componentes/responsavelPlano.css';


//----------------- FORMATAÇÃO DA DATA ----------------------//

function formatarDataParaTela(data) {

    if (!data) {
        return '';
    }

    const valor = String(data).split('T')[0];

    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {

        const [ano, mes, dia] = valor.split('-');

        return `${dia}/${mes}/${ano}`;

    }

    return valor;

}


//----------------- FORMATAR DATA DIGITADA ------------------//

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


//----------------- CONVERTER DATA PARA BANCO ---------------//

function converterDataParaBanco(valor) {

    const numeros = String(valor || '')
        .replace(/\D/g, '');

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


//----------------- DATA DIGITÁVEL ---------------------------//

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

        const dataFormatada = formatarDataDigitada(numeros);

        setDataTela(dataFormatada);

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


//----------------- COMPONENTE ------------------------------//

function ResponsavelPlano({
    idColaborador,
    setIdColaborador,
    colaboradores,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    desabilitado
}) {


    //----------------- ESTADOS ------------------------------//

    const [pesquisaColaborador, setPesquisaColaborador] =
        useState('');

    const [dropdownAberto, setDropdownAberto] =
        useState(false);

    const dropdownRef = useRef(null);


    //----------------- DATAS DIGITADAS ----------------------//

    const inicio = useDataDigitada(
        dataInicio,
        setDataInicio
    );

    const fim = useDataDigitada(
        dataFim,
        setDataFim
    );


    //----------------- RESPONSÁVEL SELECIONADO -------------//

    const responsavel = colaboradores.find((colaborador) =>

        String(colaborador.id) === String(idColaborador)

    );


    //----------------- SINCRONIZAR RESPONSÁVEL --------------//

    useEffect(() => {

        if (responsavel) {

            setPesquisaColaborador(responsavel.nome || '');

        } else {

            setPesquisaColaborador('');

        }

    }, [responsavel]);


    //----------------- FECHAR DROPDOWN ---------------------//

    useEffect(() => {

        function fecharDropdown(evento) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(evento.target)
            ) {

                setDropdownAberto(false);

            }

        }

        document.addEventListener('mousedown', fecharDropdown);

        return () => {

            document.removeEventListener(
                'mousedown',
                fecharDropdown
            );

        };

    }, []);


    //----------------- NORMALIZAR TEXTO ---------------------//

    function normalizarTexto(texto) {

        return String(texto || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

    }


    //----------------- FILTRAR COLABORADORES ---------------//

    const colaboradoresFiltrados = useMemo(() => {

        const pesquisa =
            normalizarTexto(pesquisaColaborador);

        if (!pesquisa) {
            return colaboradores;
        }

        return colaboradores.filter((colaborador) => {

            const nome =
                normalizarTexto(colaborador.nome);

            const matricula =
                normalizarTexto(obterMatricula(colaborador));

            return (
                nome.includes(pesquisa) ||
                matricula.includes(pesquisa)
            );

        });

    }, [colaboradores, pesquisaColaborador]);


    //----------------- OBTER MATRÍCULA ---------------------//

    function obterMatricula(colaborador) {

        return (
            colaborador?.matricula ||
            colaborador?.numero_matricula ||
            colaborador?.codigo ||
            'Não informada'
        );

    }


    //----------------- OBTER SETOR --------------------------//

    function obterSetor(colaborador) {

        if (!colaborador?.setor) {
            return 'Setor não informado';
        }

        if (Array.isArray(colaborador.setor)) {

            return colaborador.setor
                .map((setor) => setor.nome)
                .filter(Boolean)
                .join(', ');

        }

        if (typeof colaborador.setor === 'string') {
            return colaborador.setor;
        }

        return colaborador.setor.nome ||
            'Setor não informado';

    }


    //----------------- OBTER CARGO --------------------------//

    function obterCargo(colaborador) {

        if (!colaborador?.cargo) {
            return 'Gestor';
        }

        if (typeof colaborador.cargo === 'string') {
            return colaborador.cargo;
        }

        return colaborador.cargo.nome || 'Gestor';

    }


    //----------------- OBTER E-MAIL -------------------------//

    function obterEmail(colaborador) {

        return (
            colaborador?.email ||
            colaborador?.usuario?.email ||
            'E-mail não informado'
        );

    }


    //----------------- MONTAR INICIAIS ---------------------//

    function montarIniciais(nome) {

        if (!nome) {
            return 'CO';
        }

        const partesNome = nome.trim().split(/\s+/);

        if (partesNome.length === 1) {

            return partesNome[0]
                .substring(0, 2)
                .toUpperCase();

        }

        return (
            partesNome[0][0] +
            partesNome[partesNome.length - 1][0]
        ).toUpperCase();

    }


    //----------------- PESQUISAR RESPONSÁVEL ----------------//

    function pesquisarColaborador(evento) {

        const valor = evento.target.value;

        setPesquisaColaborador(valor);
        setDropdownAberto(true);

        if (
            responsavel &&
            valor !== responsavel.nome
        ) {

            setIdColaborador('');

        }

    }


    //----------------- SELECIONAR RESPONSÁVEL ---------------//

    function selecionarResponsavel(colaborador) {

        setIdColaborador(String(colaborador.id));

        setPesquisaColaborador(colaborador.nome || '');

        setDropdownAberto(false);

    }


    //----------------- ALTERAR RESPONSÁVEL -----------------//

    function alterarResponsavel() {

        if (desabilitado) {
            return;
        }

        setPesquisaColaborador('');
        setDropdownAberto(true);

        setIdColaborador('');

    }


    //----------------- FORMATAÇÃO DA DATA ------------------//

    function obterDiaSemana(data) {

        if (!data) {
            return '';
        }

        const dataLocal = new Date(`${data}T12:00:00`);

        if (isNaN(dataLocal.getTime())) {
            return '';
        }

        return dataLocal.toLocaleDateString(
            'pt-BR',
            {
                weekday: 'long'
            }
        );

    }


    //----------------- TELA --------------------------------//

    return (

        <section className="responsavel-periodo-plano">

            {/* CABEÇALHO */}

            <div className="cabecalho-responsavel-plano">

                <h2>
                    Defina o responsável e o período de execução
                </h2>

                <p>
                    Atribua um profissional habilitado da liderança
                    e estabeleça prazos executáveis para garantir
                    accountability, aderência às metas corporativas
                    e resposta tempestiva.
                </p>

            </div>


            {/* RESPONSÁVEL */}

            <div className="campo-responsavel-plano">

                <div className="cabecalho-campo-responsavel">

                    <label htmlFor="pesquisa-responsavel-plano">
                        Responsável pela ação <span>*</span>
                    </label>

                    <small>
                        Exibindo apenas gestores homologados
                    </small>

                </div>


                {/* PESQUISA DO RESPONSÁVEL */}

                <div
                    className="dropdown-responsavel-plano"
                    ref={dropdownRef}
                >

                    <div className="input-responsavel-plano">

                        <span className="icone-responsavel-plano">
                            ♙
                        </span>

                        <input
                            id="pesquisa-responsavel-plano"
                            type="text"
                            value={pesquisaColaborador}
                            onChange={pesquisarColaborador}
                            onFocus={() => setDropdownAberto(true)}
                            placeholder="Digite o nome ou matrícula..."
                            autoComplete="off"
                            disabled={desabilitado}
                            aria-expanded={dropdownAberto}
                            aria-haspopup="listbox"
                        />

                        {responsavel && (

                            <button
                                type="button"
                                className="botao-alterar-responsavel-plano"
                                onClick={alterarResponsavel}
                                disabled={desabilitado}
                            >
                                Alterar
                            </button>

                        )}

                        <span className="seta-responsavel-plano">
                            ⌄
                        </span>

                    </div>


                    {/* LISTA DE RESULTADOS */}

                    {dropdownAberto && !desabilitado && (

                        <div
                            className="lista-responsavel-plano"
                            role="listbox"
                        >

                            {colaboradoresFiltrados.length > 0 ? (

                                colaboradoresFiltrados.map((colaborador) => (

                                    <button
                                        key={colaborador.id}
                                        type="button"
                                        className="opcao-responsavel-plano"
                                        role="option"
                                        aria-selected={
                                            String(colaborador.id) ===
                                            String(idColaborador)
                                        }
                                        onClick={() =>
                                            selecionarResponsavel(colaborador)
                                        }
                                    >

                                        <div className="avatar-opcao-responsavel-plano">
                                            {montarIniciais(colaborador.nome)}
                                        </div>

                                        <div className="dados-opcao-responsavel-plano">

                                            <strong>
                                                {colaborador.nome}
                                            </strong>

                                            <span>
                                                Matrícula: #{obterMatricula(colaborador)}
                                            </span>

                                        </div>

                                    </button>

                                ))

                            ) : (

                                <div className="lista-vazia-responsavel-plano">
                                    Nenhum colaborador encontrado.
                                </div>

                            )}

                        </div>

                    )}

                </div>


                {/* CARTÃO DO RESPONSÁVEL SELECIONADO */}

                {responsavel && (

                    <div className="card-detalhes-responsavel">

                        <div className="detalhes-responsavel-conteudo">

                            <div className="nome-responsavel-plano">

                                <strong>
                                    {responsavel.nome}
                                </strong>

                                <span className="badge-gestor-plano">
                                    Gestor Designado
                                </span>

                            </div>


                            <p className="cargo-responsavel-plano">
                                {obterCargo(responsavel)}
                            </p>


                            <p className="setor-responsavel-plano">
                                <span>▣</span>
                                {obterSetor(responsavel)}
                            </p>


                            <p className="email-responsavel-plano">
                                <span>✉</span>
                                {obterEmail(responsavel)}
                            </p>

                        </div>

                    </div>

                )}

            </div>


            {/* PERÍODO DE EXECUÇÃO */}

            <div className="campos-periodo-responsavel">


                {/* DATA DE INÍCIO */}

                <div className="campo-periodo-plano">

                    <div className="cabecalho-campo-periodo">

                        <label htmlFor="data-inicio-plano">
                            Data de início <span>*</span>
                        </label>

                        <small>
                            {obterDiaSemana(dataInicio)}
                        </small>

                    </div>

                    <div className="input-data-periodo">

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
                            disabled={desabilitado}
                        />

                    </div>

                    <small className="ajuda-periodo-plano">
                        Data prevista para início prático da
                        intervenção pela liderança.
                    </small>

                </div>


                {/* PRAZO PARA CONCLUSÃO */}

                <div className="campo-periodo-plano">

                    <div className="cabecalho-campo-periodo">

                        <label htmlFor="data-fim-plano">
                            Prazo para conclusão <span>*</span>
                        </label>

                        <span className="badge-meta-entrega">
                            Meta de Entrega
                        </span>

                    </div>

                    <div className="input-data-periodo">

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
                            disabled={desabilitado}
                        />

                    </div>

                    <small className="ajuda-periodo-plano">
                        Data limite de entrega antes de sinalização
                        de atraso no painel executivo.
                    </small>

                </div>

            </div>

        </section>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default ResponsavelPlano;
