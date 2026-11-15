
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import Revisao from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import { cadastrarJornadaEscala } from './servicos/cadastroJornada.js';
import editarJornadaApi from './servicos/editarJornadaApi.js';

import validarJornada from './funcoes/cadastroJornada/validarJornada.js';

import './css-jornadaEscala/cadastroJornada.css';

import horarioInicioIcone from './img/horaInicio-icon.svg';
import horarioFimIcone from './img/horaFim-icon.svg';


//----------------- DIAS DA SEMANA --------------------------//

const opcoesDiasSemana = [
    { sigla: 'Seg', siglaAPI: 'SEG', nome: 'Segunda-feira' },
    { sigla: 'Ter', siglaAPI: 'TER', nome: 'Terça-feira' },
    { sigla: 'Qua', siglaAPI: 'QUA', nome: 'Quarta-feira' },
    { sigla: 'Qui', siglaAPI: 'QUI', nome: 'Quinta-feira' },
    { sigla: 'Sex', siglaAPI: 'SEX', nome: 'Sexta-feira' },
    { sigla: 'Sáb', siglaAPI: 'SAB', nome: 'Sábado' },
    { sigla: 'Dom', siglaAPI: 'DOM', nome: 'Domingo' }
];


//----------------- IDENTIFICAR A JORNADA -------------------//

function obterIdJornadaDoDia(dia) {
    if (dia.id_jornada_escala != null) {
        return Number(dia.id_jornada_escala);
    }

    const relacionamento = dia.jornada_escala ?? dia.jornadaEscala;

    if (!relacionamento) {
        return null;
    }

    let jornadaRelacionada = relacionamento;

    if (relacionamento.jornadaEscala != null) {
        jornadaRelacionada = relacionamento.jornadaEscala;
    }

    if (relacionamento.response?.jornadaEscala != null) {
        jornadaRelacionada = relacionamento.response.jornadaEscala;
    }

    if (Array.isArray(jornadaRelacionada)) {
        jornadaRelacionada = jornadaRelacionada[0];
    }

    const id = jornadaRelacionada?.id
        ?? jornadaRelacionada?.id_jornada_escala;

    return id != null ? Number(id) : null;
}


//----------------- FORMATAR HORÁRIO ------------------------//

function formatarHorario(valor) {
    const numeros = valor.replace(/\D/g, '').slice(0, 4);

    if (numeros.length > 2) {
        return numeros.slice(0, 2) + ':' + numeros.slice(2);
    }

    return numeros;
}


//----------------- COMPONENTE ------------------------------//

function CadastroJornada({
    voltar,
    jornada = null,
    diasSemana: diasRecebidos = [],
    modoEdicao = false
}) {

    //----------------- ESTADOS DOS CAMPOS -------------------//

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState(1);

    const [horarioInicio, setHorarioInicio] = useState('');
    const [horarioTermino, setHorarioTermino] = useState('');

    const [diasAtivos, setDiasAtivos] = useState([
        'Seg', 'Ter', 'Qua', 'Qui', 'Sex'
    ]);

    //----------------- ESTADOS DAS MENSAGENS ----------------//

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    //----------------- ESTADOS DOS ERROS --------------------//

    const [erroNome, setErroNome] = useState('');
    const [erroHorarioInicio, setErroHorarioInicio] = useState('');
    const [erroHorarioTermino, setErroHorarioTermino] = useState('');
    const [erroDiasAtivos, setErroDiasAtivos] = useState('');

    const [salvando, setSalvando] = useState(false);


    //----------------- PREENCHER EDIÇÃO ----------------------//

    useEffect(() => {
        if (!modoEdicao || !jornada) {
            return;
        }

        setNome(jornada.nome || '');
        setDescricao(jornada.descricao || '');
        setStatus(Number(jornada.status ?? 1));

        setHorarioInicio(
            String(jornada.hora_inicio || '').slice(0, 5)
        );

        setHorarioTermino(
            String(jornada.hora_fim || '').slice(0, 5)
        );

        const idJornada = Number(jornada.id);

        const diasDaJornada = diasRecebidos.filter((dia) => {
            return obterIdJornadaDoDia(dia) === idJornada;
        });

        const diasSelecionados = opcoesDiasSemana
            .filter((dia) => {
                return diasDaJornada.some((diaRecebido) => {
                    return (
                        diaRecebido.dia_sigla === dia.siglaAPI &&
                        Number(diaRecebido.ativo) === 1
                    );
                });
            })
            .map((dia) => dia.sigla);

        setDiasAtivos(diasSelecionados);

        setErroNome('');
        setErroHorarioInicio('');
        setErroHorarioTermino('');
        setErroDiasAtivos('');

    }, [modoEdicao, jornada, diasRecebidos]);


    //----------------- ALTERAR NOME --------------------------//

    function alterarNome(valor) {
        setNome(valor);

        if (erroNome) {
            setErroNome('');
        }

        setErro('');
        setSucesso('');
    }


    //----------------- ALTERAR DIA ---------------------------//

    function alterarDia(dia) {
        setDiasAtivos((diasAtuais) => {
            let novosDias;

            if (diasAtuais.includes(dia)) {
                novosDias = diasAtuais.filter((item) => item !== dia);
            } else {
                novosDias = [...diasAtuais, dia];
            }

            if (novosDias.length > 0) {
                setErroDiasAtivos('');
            }

            setSucesso('');
            setErro('');

            return novosDias;
        });
    }


    //----------------- ALTERAR HORÁRIOS ----------------------//

    function alterarHorarioInicio(evento) {
        const valor = formatarHorario(evento.target.value);

        setHorarioInicio(valor);

        if (erroHorarioInicio) {
            setErroHorarioInicio('');
        }

        if (valor !== horarioTermino && erroHorarioTermino) {
            setErroHorarioTermino('');
        }

        setErro('');
        setSucesso('');
    }

    function alterarHorarioTermino(evento) {
        const valor = formatarHorario(evento.target.value);

        setHorarioTermino(valor);

        if (erroHorarioTermino) {
            setErroHorarioTermino('');
        }

        setErro('');
        setSucesso('');
    }


    //----------------- VALIDAR FORMULÁRIO --------------------//

    function validarFormulario() {
        const resultado = validarJornada({
            nome,
            horarioInicio,
            horarioTermino,
            diasAtivos
        });

        setErroNome(resultado.erroNome);
        setErroHorarioInicio(resultado.erroHorarioInicio);
        setErroHorarioTermino(resultado.erroHorarioTermino);
        setErroDiasAtivos(resultado.erroDiasAtivos);

        return resultado.valido;
    }


    //----------------- LIMPAR FORMULÁRIO ---------------------//

    function limparFormulario() {
        setNome('');
        setDescricao('');
        setStatus(1);

        setHorarioInicio('');
        setHorarioTermino('');

        setDiasAtivos([
            'Seg', 'Ter', 'Qua', 'Qui', 'Sex'
        ]);

        setErroNome('');
        setErroHorarioInicio('');
        setErroHorarioTermino('');
        setErroDiasAtivos('');

        setErro('');
    }


    //----------------- SALVAR JORNADA ------------------------//

    async function salvarJornada(evento) {
        if (evento?.preventDefault) {
            evento.preventDefault();
        }

        if (salvando) {
            return;
        }

        setErro('');
        setSucesso('');

        if (!validarFormulario()) {
            return;
        }

        if (modoEdicao && (!jornada || jornada.id == null)) {
            setErro('Não foi possível identificar a jornada que será editada.');
            return;
        }

        const dadosJornada = {
            nome: nome.trim(),
            descricao: descricao.trim(),
            status: Number(status),

            hora_inicio: `${horarioInicio}:00`,
            hora_fim: `${horarioTermino}:00`,

            dias: opcoesDiasSemana.map((dia) => ({
                dia_semana: dia.nome,
                dia_sigla: dia.siglaAPI,
                ativo: diasAtivos.includes(dia.sigla) ? 1 : 0
            }))
        };


        //----------------- REGISTROS EXISTENTES --------------//

        let diasExistentes = [];

        if (modoEdicao) {
            const idJornada = Number(jornada.id);

            diasExistentes = diasRecebidos.filter((dia) => {
                return obterIdJornadaDoDia(dia) === idJornada;
            });

            if (
                diasExistentes.length === 0 ||
                diasExistentes.some((dia) => dia.id == null)
            ) {
                setErro(
                    'Não foi possível identificar os dias cadastrados desta jornada.'
                );

                return;
            }
        }


        //----------------- ENVIAR PARA A API ------------------//

        setSalvando(true);

        try {

            //----------------- EDITAR -------------------------//

            if (modoEdicao) {
                await editarJornadaApi(
                    jornada.id,
                    dadosJornada,
                    diasExistentes
                );

                setSucesso('Jornada atualizada com sucesso!');

                return;
            }


            //----------------- CADASTRAR ----------------------//

            await cadastrarJornadaEscala(dadosJornada);

            // Limpa os campos após o cadastro.
            limparFormulario();

            // Exibe a confirmação na tela.
            setSucesso('Jornada cadastrada com sucesso!');

        } catch (erroApi) {

            console.error(
                modoEdicao
                    ? 'Erro ao editar jornada:'
                    : 'Erro ao cadastrar jornada:',
                erroApi
            );

            if (!modoEdicao && erroApi.jornadaCriada) {
                setErro(
                    `A jornada foi criada, mas ocorreu um erro ao cadastrar os dias da semana. ID da jornada: ${erroApi.idJornada}. ${erroApi.message}`
                );

                return;
            }

            setErro(
                erroApi.message ||
                (
                    modoEdicao
                        ? 'Não foi possível atualizar a jornada. Verifique a API e tente novamente.'
                        : 'Não foi possível cadastrar a jornada. Verifique a API e tente novamente.'
                )
            );

        } finally {
            setSalvando(false);
        }
    }


    //----------------- TÍTULOS -------------------------------//

    const tituloPagina = modoEdicao
        ? 'Editar Jornada'
        : 'Nova Jornada';

    const descricaoPagina = modoEdicao
        ? 'Atualize os horários e os dias de trabalho desta jornada.'
        : 'Defina os horários e os dias de trabalho desta jornada para organizar a alocação dos colaboradores.';


    //----------------- TELA ----------------------------------//

    return (
        <>
            {/* CABEÇALHO */}

            <div className="cabecalho-nova-jornada">
                <BotaoCadastro
                    titulo={tituloPagina}
                    descricao={descricaoPagina}
                >
                    <nav className="caminho-cadastro-jornada">
                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Jornada e Escala
                        </button>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-jornada">
                            {tituloPagina}
                        </span>
                    </nav>
                </BotaoCadastro>
            </div>


            {/* FORMULÁRIO */}

            <form
                onSubmit={salvarJornada}
                noValidate
            >

                {/* INFORMAÇÕES GERAIS */}

                <Informacoes
                    titulo="Informações da jornada"
                    descricaoCard="Informe os dados básicos para identificar a jornada de trabalho."
                    nomeEntidade="jornada"
                    nome={nome}
                    setNome={alterarNome}
                    erroNome={erroNome}
                    limparErroNome={() => setErroNome('')}
                    descricao={descricao}
                    setDescricao={(valor) => {
                        setDescricao(valor);
                        setErro('');
                        setSucesso('');
                    }}
                    status={status}
                    setStatus={(valor) => {
                        setStatus(Number(valor));
                        setErro('');
                        setSucesso('');
                    }}
                    campos={['nome', 'descricao', 'status']}
                />


                {/* HORÁRIOS DE TRABALHO */}

                <section className="cartao-horarios-jornada">

                    <div className="cabecalho-horarios-jornada">
                        <div>
                            <h2>Horário de trabalho</h2>

                            <p>
                                Indique o horário padrão de início e término.
                                Não há registro ou controle eletrônico de ponto.
                            </p>
                        </div>
                    </div>


                    <div className="campos-horarios-jornada">

                        {/* HORÁRIO DE INÍCIO */}

                        <div className="campo-formulario-jornada">
                            <label htmlFor="horario-inicio-jornada">
                                Horário de início
                            </label>

                            <div
                                className={`input-horario-jornada ${
                                    erroHorarioInicio ? 'input-erro' : ''
                                }`}
                            >
                                <img src={horarioInicioIcone} alt="" />

                                <input
                                    id="horario-inicio-jornada"
                                    type="text"
                                    placeholder={
                                        erroHorarioInicio || '08:00'
                                    }
                                    value={horarioInicio}
                                    onChange={alterarHorarioInicio}
                                    maxLength={5}
                                    inputMode="numeric"
                                    aria-invalid={Boolean(erroHorarioInicio)}
                                    aria-describedby={
                                        erroHorarioInicio
                                            ? 'erro-horario-inicio'
                                            : undefined
                                    }
                                />
                            </div>

                            {erroHorarioInicio && (
                                <small
                                    id="erro-horario-inicio"
                                    className="mensagem-erro-jornada"
                                >
                                    {erroHorarioInicio}
                                </small>
                            )}
                        </div>


                        {/* HORÁRIO DE TÉRMINO */}

                        <div className="campo-formulario-jornada">
                            <label htmlFor="horario-termino-jornada">
                                Horário de término
                            </label>

                            <div
                                className={`input-horario-jornada ${
                                    erroHorarioTermino ? 'input-erro' : ''
                                }`}
                            >
                                <img src={horarioFimIcone} alt="" />

                                <input
                                    id="horario-termino-jornada"
                                    type="text"
                                    placeholder={
                                        erroHorarioTermino || '17:00'
                                    }
                                    value={horarioTermino}
                                    onChange={alterarHorarioTermino}
                                    maxLength={5}
                                    inputMode="numeric"
                                    aria-invalid={Boolean(erroHorarioTermino)}
                                    aria-describedby={
                                        erroHorarioTermino
                                            ? 'erro-horario-termino'
                                            : undefined
                                    }
                                />
                            </div>

                            {erroHorarioTermino && (
                                <small
                                    id="erro-horario-termino"
                                    className="mensagem-erro-jornada"
                                >
                                    {erroHorarioTermino}
                                </small>
                            )}
                        </div>

                    </div>
                </section>


                {/* DIAS DE TRABALHO */}

                <section
                    className={`cartao-dias-jornada ${
                        erroDiasAtivos ? 'cartao-dias-jornada-erro' : ''
                    }`}
                >

                    <div className="cabecalho-dias-jornada">
                        <h2>Dias de trabalho da jornada</h2>

                        <p>
                            Selecione os dias da semana em que há atividade nesta jornada.
                        </p>
                    </div>


                    <div className="lista-dias-jornada">

                        {opcoesDiasSemana.map((dia) => {
                            const diaAtivo = diasAtivos.includes(dia.sigla);

                            return (
                                <button
                                    type="button"
                                    key={dia.sigla}
                                    className={`card-dia-jornada ${
                                        diaAtivo
                                            ? 'dia-jornada-ativo'
                                            : 'dia-jornada-folga'
                                    }`}
                                    onClick={() => alterarDia(dia.sigla)}
                                    aria-pressed={diaAtivo}
                                    aria-label={`${dia.nome}: ${
                                        diaAtivo ? 'Ativo' : 'Folga'
                                    }`}
                                >
                                    <span className="sigla-dia-jornada">
                                        {dia.sigla}
                                    </span>

                                    <span className="status-dia-jornada">
                                        {diaAtivo ? 'Ativo' : 'Folga'}
                                    </span>
                                </button>
                            );
                        })}

                    </div>

                    {erroDiasAtivos && (
                        <small className="mensagem-erro-jornada">
                            {erroDiasAtivos}
                        </small>
                    )}

                </section>


                {/* REVISÃO E MENSAGEM DE CONFIRMAÇÃO */}

                <Revisao
                    nome={nome}
                    descricao={
                        `Horário: ${horarioInicio || 'Não informado'} às ${
                            horarioTermino || 'Não informado'
                        }. Dias de trabalho: ${
                            opcoesDiasSemana
                                .filter((dia) => diasAtivos.includes(dia.sigla))
                                .map((dia) => dia.nome)
                                .join(', ') || 'Nenhum dia selecionado'
                        }.`
                    }
                    status={status}
                    tituloNome="Nome da jornada"
                    mostrarCodigo={false}
                    mostrarResponsavel={false}
                    mostrarDescricao={true}
                    erro={erro}
                    sucesso={sucesso}
                />


                {/* BOTÕES */}

                <div className="botoes-cadastro-jornada">
                    <BotaoSalvarCancelar
                        onCancelar={voltar}
                        onSalvar={salvarJornada}
                        salvando={salvando}
                        textoBotao={
                            modoEdicao
                                ? 'Salvar alterações'
                                : 'Salvar jornada'
                        }
                    />
                </div>

            </form>
        </>
    );
}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroJornada;
