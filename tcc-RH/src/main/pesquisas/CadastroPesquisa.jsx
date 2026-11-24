import { useEffect, useState } from 'react';

import {
    buscarSetoresPesquisa,
    buscarCargosPesquisa,
    buscarColaboradoresPesquisa,
    cadastrarPesquisaCompleta
} from './servicos/cadastroPesquisaApi.js';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';

import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import './css-pesquisas/cadastroPesquisa.css';


//----------------- ALTERNATIVAS FIXAS ----------------------//

const alternativasFixas = [
    'Excelente',
    'Bom',
    'Regular',
    'Ruim'
];


//----------------- DATA LOCAL -----------------------------//

function dataAtual() {

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;

}


//----------------- COMPONENTE -----------------------------//

function CadastroPesquisa({ voltar, aoCadastrar }) {

    //----------------- DADOS DA PESQUISA ------------------//

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');

    const [dataInicio, setDataInicio] = useState(dataAtual());
    const [dataFim, setDataFim] = useState('');


    //----------------- PÚBLICO E PRIVACIDADE --------------//

    const [anonimo, setAnonimo] = useState(true);
    const [publico, setPublico] = useState('TODOS');

    const [setores, setSetores] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);

    const [setoresSelecionados, setSetoresSelecionados] = useState([]);
    const [cargosSelecionados, setCargosSelecionados] = useState([]);


    //----------------- PERGUNTAS --------------------------//

    const [perguntas, setPerguntas] = useState([
        {
            enunciado: '',
            tipo: 'alternativa',
            obrigatorio: 1
        }
    ]);


    //----------------- ESTADOS DA TELA ---------------------//

    const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');
    const [erroSalvar, setErroSalvar] = useState('');


    //----------------- CARREGAR OPÇÕES --------------------//

    useEffect(() => {

        async function carregarOpcoes() {

            try {

                setCarregandoOpcoes(true);
                setErro('');

                const [
                    listaSetores,
                    listaCargos,
                    listaColaboradores
                ] = await Promise.all([

                    buscarSetoresPesquisa(),
                    buscarCargosPesquisa(),
                    buscarColaboradoresPesquisa()

                ]);

                setSetores(listaSetores);
                setCargos(listaCargos);
                setColaboradores(listaColaboradores);

            } catch (erro) {

                setErro(
                    erro.message ||
                    'Não foi possível carregar os dados da pesquisa.'
                );

            } finally {

                setCarregandoOpcoes(false);

            }

        }

        carregarOpcoes();

    }, []);


    //----------------- CONTAR PÚBLICO DA PESQUISA ----------//

    function contarColaboradoresPublico() {

        // Considera somente colaboradores ativos.
        const colaboradoresAtivos = colaboradores.filter(
            colaborador => colaborador.status === 'Ativo'
        );


        // Todos os colaboradores ativos.
        if (publico === 'TODOS') {

            return colaboradoresAtivos.length;

        }


        // Colaboradores pertencentes aos setores selecionados.
        if (publico === 'SETOR') {

            if (setoresSelecionados.length === 0) {
                return 0;
            }

            return colaboradoresAtivos.filter(colaborador =>

                colaborador.setor?.some(setor =>

                    setoresSelecionados.some(idSelecionado =>

                        Number(idSelecionado) === Number(setor.id)

                    )

                )

            ).length;

        }


        // Colaboradores que possuem os cargos selecionados.
        if (publico === 'CARGO') {

            if (cargosSelecionados.length === 0) {
                return 0;
            }

            return colaboradoresAtivos.filter(colaborador =>

                cargosSelecionados.some(idSelecionado =>

                    Number(idSelecionado) ===
                    Number(colaborador.cargo?.id)

                )

            ).length;

        }

        return 0;

    }


    //----------------- ADICIONAR PERGUNTA ------------------//

    function adicionarPergunta() {

        setPerguntas(anteriores => [

            ...anteriores,

            {
                enunciado: '',
                tipo: 'alternativa',
                obrigatorio: 1
            }

        ]);

    }


    //----------------- REMOVER PERGUNTA -------------------//

    function removerPergunta(indice) {

        if (perguntas.length === 1) {

            setErro('A pesquisa precisa ter pelo menos uma pergunta.');

            return;

        }

        setPerguntas(anteriores =>

            anteriores.filter((_, index) => index !== indice)

        );

        setErro('');

    }


    //----------------- ATUALIZAR PERGUNTA -----------------//

    function atualizarPergunta(indice, campo, valor) {

        setPerguntas(anteriores =>

            anteriores.map((pergunta, index) => {

                if (index !== indice) {
                    return pergunta;
                }

                const perguntaAtualizada = {
                    ...pergunta,
                    [campo]: valor
                };

                // Define a obrigatoriedade padrão pelo tipo.
                if (campo === 'tipo') {

                    perguntaAtualizada.obrigatorio =
                        valor === 'alternativa' ? 1 : 0;

                }

                return perguntaAtualizada;

            })

        );

    }


    //----------------- ALTERAR PÚBLICO --------------------//

    function alterarPublico(valor) {

        setPublico(valor);

        // Limpa as seleções anteriores ao trocar o público.
        setSetoresSelecionados([]);
        setCargosSelecionados([]);

    }


    //----------------- SELECIONAR SETOR -------------------//

    function alternarSetor(idSetor) {

        const id = Number(idSetor);

        setSetoresSelecionados(anteriores =>

            anteriores.some(item => Number(item) === id)

                ? anteriores.filter(item => Number(item) !== id)

                : [...anteriores, id]

        );

    }


    //----------------- SELECIONAR CARGO -------------------//

    function alternarCargo(idCargo) {

        const id = Number(idCargo);

        setCargosSelecionados(anteriores =>

            anteriores.some(item => Number(item) === id)

                ? anteriores.filter(item => Number(item) !== id)

                : [...anteriores, id]

        );

    }


    //----------------- VALIDAR FORMULÁRIO -----------------//

    function validarFormulario() {

        if (!titulo.trim()) {
            return 'Informe o título da pesquisa.';
        }

        if (!dataInicio) {
            return 'Informe a data de início.';
        }

        if (!dataFim) {
            return 'Informe a data de término.';
        }

        if (dataFim < dataInicio) {
            return 'A data de término não pode ser anterior à data de início.';
        }

        if (perguntas.length === 0) {
            return 'Adicione pelo menos uma pergunta.';
        }

        for (let indice = 0; indice < perguntas.length; indice++) {

            if (!perguntas[indice].enunciado.trim()) {

                return `Preencha o enunciado da pergunta ${indice + 1}.`;

            }

        }

        if (
            publico === 'SETOR' &&
            setoresSelecionados.length === 0
        ) {

            return 'Selecione pelo menos um setor.';

        }

        if (
            publico === 'CARGO' &&
            cargosSelecionados.length === 0
        ) {

            return 'Selecione pelo menos um cargo.';

        }

        return '';

    }


    //----------------- SALVAR PESQUISA ---------------------//

    async function salvarPesquisa() {

        if (salvando) {
            return;
        }

        setErro('');
        setErroSalvar('');

        const mensagemValidacao = validarFormulario();

        if (mensagemValidacao) {

            setErro(mensagemValidacao);

            return;

        }

        const dadosPesquisa = {

            titulo: titulo.trim(),

            descricao: descricao.trim(),

            data_inicio: dataInicio,

            data_fim: dataFim,

            anonimo: anonimo ? 1 : 0,

            // Pesquisa cadastrada como ativa, não encerrada.
            status: 0,

            publico_selecionado: publico,

            setores: setoresSelecionados,

            cargos: cargosSelecionados

        };

        try {

            setSalvando(true);

            const idPesquisa = await cadastrarPesquisaCompleta(
                dadosPesquisa,
                perguntas,
                colaboradores
            );

            await aoCadastrar?.(idPesquisa);

        } catch (erro) {

            setErroSalvar(
                erro.message || 'Não foi possível cadastrar a pesquisa.'
            );

        } finally {

            setSalvando(false);

        }

    }


    //----------------- QUANTIDADE DO PÚBLICO ----------------//

    const totalColaboradoresPublico = contarColaboradoresPublico();


    //----------------- TELA PRINCIPAL ----------------------//

    return (

        <main className="cadastro-pesquisa">


            {/* CABEÇALHO */}

            <div className="cabecalho-nova-pesquisa">

                <BotaoCadastro

                    titulo="Nova Pesquisa"

                    descricao="Crie uma pesquisa para coletar percepções e opiniões dos colaboradores."

                >

                    <nav className="caminho-cadastro-pesquisa">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Pesquisas
                        </button>

                        <span className="seta">
                            &gt;
                        </span>

                        <span className="pagina-atual-pesquisa">
                            Nova Pesquisa
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* ERRO DE CARREGAMENTO */}

            {erro && (

                <p className="erro-cadastro-pesquisa" role="alert">
                    {erro}
                </p>

            )}


            {/* ETAPA 1 - IDENTIFICAÇÃO */}

            <section className="cartao-cadastro-pesquisa">

                <div className="cabecalho-etapa-pesquisa">

                    <div className="informacao-etapa-pesquisa">

                        <span className="numero-etapa-pesquisa">
                            01
                        </span>

                        <div>

                            <span className="legenda-etapa-pesquisa">
                                ETAPA 1
                            </span>

                            <h2>Identificação da Pesquisa</h2>

                        </div>

                    </div>

                    <span className="status-etapa-pesquisa">
                        Preenchimento obrigatório
                    </span>

                </div>


                <div className="campos-identificacao-pesquisa">

                    <div className="campo-pesquisa">

                        <div className="rotulo-campo-pesquisa">

                            <label htmlFor="titulo-pesquisa">
                                Título da pesquisa <span>*</span>
                            </label>

                            <small>{titulo.length} / 255</small>

                        </div>

                        <input
                            id="titulo-pesquisa"
                            type="text"
                            maxLength={255}
                            value={titulo}
                            placeholder="Ex.: Pesquisa de Clima Organizacional"
                            onChange={evento => setTitulo(evento.target.value)}
                        />

                    </div>


                    <div className="campo-pesquisa">

                        <div className="rotulo-campo-pesquisa">

                            <label htmlFor="descricao-pesquisa">
                                Descrição da pesquisa
                            </label>

                        </div>

                        <textarea
                            id="descricao-pesquisa"
                            rows={3}
                            value={descricao}
                            placeholder="Descreva o objetivo desta pesquisa."
                            onChange={evento => setDescricao(evento.target.value)}
                        />

                    </div>


                    <div className="campos-periodo-pesquisa">

                        <div className="campo-pesquisa">

                            <label htmlFor="data-inicio-pesquisa">
                                Data de início <span>*</span>
                            </label>

                            <input
                                id="data-inicio-pesquisa"
                                type="date"
                                value={dataInicio}
                                onChange={evento => setDataInicio(evento.target.value)}
                            />

                        </div>


                        <div className="campo-pesquisa">

                            <label htmlFor="data-fim-pesquisa">
                                Data de encerramento <span>*</span>
                            </label>

                            <input
                                id="data-fim-pesquisa"
                                type="date"
                                min={dataInicio}
                                value={dataFim}
                                onChange={evento => setDataFim(evento.target.value)}
                            />

                        </div>

                    </div>


                    <div className="privacidade-pesquisa">

                        <div>

                            <strong>Respostas anônimas</strong>

                            <p>
                                Quando habilitado, as respostas individuais
                                não devem ser identificadas.
                            </p>

                        </div>

                        <label className="alternancia-pesquisa">

                            <input
                                type="checkbox"
                                checked={anonimo}
                                onChange={evento => setAnonimo(evento.target.checked)}
                            />

                            <span className="controle-alternancia-pesquisa"></span>

                        </label>

                    </div>

                </div>

            </section>


            {/* ETAPA 2 - PERGUNTAS */}

            <section className="cartao-cadastro-pesquisa">

                <div className="cabecalho-etapa-pesquisa">

                    <div className="informacao-etapa-pesquisa">

                        <div>

                            <span className="legenda-etapa-pesquisa">
                                ETAPA 2 • CONFIGURAÇÃO
                            </span>

                            <h2>Perguntas da Pesquisa</h2>

                            <p>
                                Adicione as perguntas que serão apresentadas
                                aos colaboradores.
                            </p>

                        </div>

                    </div>

                    <span className="contador-pesquisa">
                        {perguntas.length} perguntas
                    </span>

                </div>


                <div className="lista-cadastro-perguntas">

                    {perguntas.map((pergunta, indice) => (

                        <article
                            className="item-cadastro-pergunta"
                            key={indice}
                        >

                            <div className="cabecalho-item-pergunta">

                                <div className="informacao-item-pergunta">

                                    <span className="numero-pergunta-pesquisa">
                                        {String(indice + 1).padStart(2, '0')}
                                    </span>

                                    <h3>
                                        Pergunta {indice + 1}
                                    </h3>

                                </div>

                                <button
                                    type="button"
                                    className="botao-remover-pergunta-pesquisa"
                                    onClick={() => removerPergunta(indice)}
                                >
                                    Remover
                                </button>

                            </div>


                            <div className="campo-pesquisa">

                                <label htmlFor={`enunciado-pergunta-${indice}`}>
                                    Enunciado <span>*</span>
                                </label>

                                <textarea
                                    id={`enunciado-pergunta-${indice}`}
                                    rows={3}
                                    value={pergunta.enunciado}
                                    placeholder="Digite sua pergunta."
                                    onChange={evento =>
                                        atualizarPergunta(
                                            indice,
                                            'enunciado',
                                            evento.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="configuracao-pergunta-pesquisa">

                                <div className="campo-pesquisa">

                                    <label htmlFor={`tipo-pergunta-${indice}`}>
                                        Tipo de resposta
                                    </label>

                                    <select
                                        id={`tipo-pergunta-${indice}`}
                                        value={pergunta.tipo}
                                        onChange={evento =>
                                            atualizarPergunta(
                                                indice,
                                                'tipo',
                                                evento.target.value
                                            )
                                        }
                                    >

                                        <option value="alternativa">
                                            Alternativa
                                        </option>

                                        <option value="discursiva">
                                            Discursiva
                                        </option>

                                    </select>

                                </div>


                                <label className="obrigatoria-pergunta-pesquisa">

                                    <input
                                        type="checkbox"
                                        checked={Number(pergunta.obrigatorio) === 1}
                                        onChange={evento =>
                                            atualizarPergunta(
                                                indice,
                                                'obrigatorio',
                                                evento.target.checked ? 1 : 0
                                            )
                                        }
                                    />

                                    <span>Pergunta obrigatória</span>

                                </label>

                            </div>


                            {/* ALTERNATIVAS FIXAS */}

                            {pergunta.tipo === 'alternativa' && (

                                <div className="alternativas-fixas-pesquisa">

                                    <div className="cabecalho-alternativas-pesquisa">

                                        <strong>Opções de resposta</strong>

                                        <span>Alternativas fixas</span>

                                    </div>

                                    <div className="lista-alternativas-fixas-pesquisa">

                                        {alternativasFixas.map(alternativa => (

                                            <div key={alternativa}>
                                                {alternativa}
                                            </div>

                                        ))}

                                    </div>

                                    <p>
                                        Estas opções serão utilizadas pelos
                                        colaboradores ao responder à pergunta.
                                    </p>

                                </div>

                            )}

                        </article>

                    ))}

                </div>


                <button
                    type="button"
                    className="botao-adicionar-pergunta-pesquisa"
                    onClick={adicionarPergunta}
                >
                    + Adicionar pergunta
                </button>

            </section>


            {/* ETAPA 3 - PÚBLICO */}

            <section className="cartao-cadastro-pesquisa">

                <div className="cabecalho-etapa-pesquisa">

                    <div className="informacao-etapa-pesquisa">

                        <div>

                            <span className="legenda-etapa-pesquisa">
                                ETAPA 3
                            </span>

                            <h2>Público da Pesquisa</h2>

                            <p>
                                Defina quais colaboradores poderão participar.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="opcoes-publico-pesquisa">

                    <label className="opcao-publico-pesquisa">

                        <input
                            type="radio"
                            name="publico-pesquisa"
                            checked={publico === 'TODOS'}
                            onChange={() => alterarPublico('TODOS')}
                        />

                        <span>Todos os colaboradores</span>

                    </label>


                    <label className="opcao-publico-pesquisa">

                        <input
                            type="radio"
                            name="publico-pesquisa"
                            checked={publico === 'SETOR'}
                            onChange={() => alterarPublico('SETOR')}
                        />

                        <span>Setores específicos</span>

                    </label>


                    <label className="opcao-publico-pesquisa">

                        <input
                            type="radio"
                            name="publico-pesquisa"
                            checked={publico === 'CARGO'}
                            onChange={() => alterarPublico('CARGO')}
                        />

                        <span>Cargos específicos</span>

                    </label>

                </div>


                {/* SELEÇÃO DE SETORES */}

                {publico === 'SETOR' && (

                    <div className="selecao-itens-pesquisa">

                        <h3>Selecione os setores</h3>

                        {carregandoOpcoes ? (

                            <p>Carregando setores...</p>

                        ) : setores.length === 0 ? (

                            <p>Nenhum setor disponível.</p>

                        ) : (

                            <div className="lista-itens-publico-pesquisa">

                                {setores.map(setor => (

                                    <label key={setor.id}>

                                        <input
                                            type="checkbox"
                                            checked={setoresSelecionados.some(
                                                id => Number(id) === Number(setor.id)
                                            )}
                                            onChange={() => alternarSetor(setor.id)}
                                        />

                                        <span>{setor.nome}</span>

                                    </label>

                                ))}

                            </div>

                        )}

                    </div>

                )}


                {/* SELEÇÃO DE CARGOS */}

                {publico === 'CARGO' && (

                    <div className="selecao-itens-pesquisa">

                        <h3>Selecione os cargos</h3>

                        {carregandoOpcoes ? (

                            <p>Carregando cargos...</p>

                        ) : cargos.length === 0 ? (

                            <p>Nenhum cargo disponível.</p>

                        ) : (

                            <div className="lista-itens-publico-pesquisa">

                                {cargos.map(cargo => (

                                    <label key={cargo.id}>

                                        <input
                                            type="checkbox"
                                            checked={cargosSelecionados.some(
                                                id => Number(id) === Number(cargo.id)
                                            )}
                                            onChange={() => alternarCargo(cargo.id)}
                                        />

                                        <span>{cargo.nome}</span>

                                    </label>

                                ))}

                            </div>

                        )}

                    </div>

                )}


                {/* RESUMO DO PÚBLICO */}

                <div className="resumo-publico-pesquisa">

                    <div>

                        <strong>Público estimado</strong>

                        <p>
                            Quantidade de colaboradores ativos que poderão
                            responder a esta pesquisa.
                        </p>

                    </div>

                    <span>

                        {carregandoOpcoes
                            ? 'Calculando...'
                            : `${totalColaboradoresPublico} ${
                                totalColaboradoresPublico === 1
                                    ? 'colaborador'
                                    : 'colaboradores'
                            }`
                        }

                    </span>

                </div>

            </section>


            {/* ERROS */}

            {erro && (

                <p className="erro-cadastro-pesquisa" role="alert">
                    {erro}
                </p>

            )}

            {erroSalvar && (

                <p className="erro-cadastro-pesquisa" role="alert">
                    {erroSalvar}
                </p>

            )}


            {/* BOTÕES */}

            <div className="botoes-cadastro-pesquisa">

                <BotaoSalvarCancelar
                    onCancelar={voltar}
                    onSalvar={salvarPesquisa}
                    salvando={salvando}
                    textoBotao="Cadastrar Pesquisa"
                />

            </div>

        </main>

    );

}

export default CadastroPesquisa;