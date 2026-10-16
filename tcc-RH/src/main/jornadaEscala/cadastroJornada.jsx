
 //----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
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

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState(1);

    const [horarioInicio, setHorarioInicio] = useState('');
    const [horarioTermino, setHorarioTermino] = useState('');

    const [diasAtivos, setDiasAtivos] = useState([
        'Seg', 'Ter', 'Qua', 'Qui', 'Sex'
    ]);

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

    }, [modoEdicao, jornada, diasRecebidos]);


    //----------------- ALTERAR DIA --------------------------//

    function alterarDia(dia) {

        setDiasAtivos((diasAtuais) => {

            if (diasAtuais.includes(dia)) {
                return diasAtuais.filter((item) => item !== dia);
            }

            return [...diasAtuais, dia];
        });
    }


    //----------------- SALVAR JORNADA ------------------------//

    async function salvarJornada() {

        if (salvando) {
            return;
        }

        const mensagemErro = validarJornada({
            nome,
            horarioInicio,
            horarioTermino,
            diasAtivos
        });

        if (mensagemErro) {
            alert(mensagemErro);
            return;
        }

        if (modoEdicao && (!jornada || jornada.id == null)) {
            alert('Não foi possível identificar a jornada que será editada.');
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

            // Não exige sete registros: a API pode retornar menos dias.

            if (
                diasExistentes.length === 0 ||
                diasExistentes.some((dia) => dia.id == null)
            ) {
                alert(
                    'Não foi possível identificar os dias cadastrados desta jornada.'
                );

                return;
            }
        }

        setSalvando(true);

        try {

            //----------------- EDITAR -------------------------//

            if (modoEdicao) {

                await editarJornadaApi(
                    jornada.id,
                    dadosJornada,
                    diasExistentes
                );

                alert('Jornada atualizada com sucesso!');

                await voltar();

                return;
            }

            //----------------- CADASTRAR ----------------------//

            await cadastrarJornadaEscala(dadosJornada);

            alert('Jornada cadastrada com sucesso!');

            await voltar();

        } catch (erro) {

            console.error(
                modoEdicao
                    ? 'Erro ao editar jornada:'
                    : 'Erro ao cadastrar jornada:',
                erro
            );

            if (!modoEdicao && erro.jornadaCriada) {

                alert(
                    `A jornada foi criada, mas ocorreu um erro ao cadastrar os dias da semana.\n\n` +
                    `ID da jornada: ${erro.idJornada}\n` +
                    `Erro: ${erro.message}\n\n` +
                    'Confira os dias cadastrados antes de tentar novamente.'
                );

                await voltar();

                return;
            }

            alert(
                erro.message ||
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


    //----------------- ALTERAR HORÁRIOS ---------------------//

    function alterarHorarioInicio(evento) {
        setHorarioInicio(formatarHorario(evento.target.value));
    }

    function alterarHorarioTermino(evento) {
        setHorarioTermino(formatarHorario(evento.target.value));
    }


    //----------------- TÍTULOS -------------------------------//

    const tituloPagina = modoEdicao
        ? 'Editar Jornada'
        : 'Nova Jornada';

    const descricaoPagina = modoEdicao
        ? 'Atualize os horários e os dias de trabalho desta jornada.'
        : 'Defina os horários e os dias de trabalho desta jornada para organizar a alocação dos colaboradores.';


    //----------------- TELA ---------------------------------//

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


            {/* INFORMAÇÕES GERAIS */}

            <Informacoes
                titulo="Informações da jornada"
                descricaoCard="Informe os dados básicos para identificar a jornada de trabalho."
                nomeEntidade="jornada"
                nome={nome}
                setNome={setNome}
                descricao={descricao}
                setDescricao={setDescricao}
                status={status}
                setStatus={setStatus}
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

                    <div className="campo-formulario-jornada">

                        <label htmlFor="horario-inicio-jornada">
                            Horário de início
                        </label>

                        <div className="input-horario-jornada">

                            <img src={horarioInicioIcone} alt="" />

                            <input
                                id="horario-inicio-jornada"
                                type="text"
                                placeholder="08:00"
                                value={horarioInicio}
                                onChange={alterarHorarioInicio}
                                maxLength={5}
                                inputMode="numeric"
                                required
                            />

                        </div>

                    </div>

                    <div className="campo-formulario-jornada">

                        <label htmlFor="horario-termino-jornada">
                            Horário de término
                        </label>

                        <div className="input-horario-jornada">

                            <img src={horarioFimIcone} alt="" />

                            <input
                                id="horario-termino-jornada"
                                type="text"
                                placeholder="17:00"
                                value={horarioTermino}
                                onChange={alterarHorarioTermino}
                                maxLength={5}
                                inputMode="numeric"
                                required
                            />

                        </div>

                    </div>

                </div>

            </section>


            {/* DIAS DE TRABALHO */}

            <section className="cartao-dias-jornada">

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

            </section>


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

        </>
    );
}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroJornada;
