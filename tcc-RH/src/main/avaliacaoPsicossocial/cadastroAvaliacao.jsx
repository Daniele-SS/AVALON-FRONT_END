
 //----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import IdentificacaoAvaliacao from './componentes/IdentificacaoAvaliacao.jsx';
import SelecaoPublico from './componentes/SelecaoPublico.jsx';
import CardFator from './componentes/CardFator.jsx';
import ListaPerguntas from './componentes/ListaPerguntas.jsx';
import SelecaoRegras from './componentes/SelecaoRegras.jsx';

import { buscarPerguntasAvaliacao } from './servico/buscarPerguntasApi.js';
import buscarCargosAvaliacao from './servico/buscarCargosAvaliacao.js';
import buscarSetoresAvaliacao from './servico/buscarSetoresAvaliacao.js';

import buscarDadosMotorRegras from '../motorRegras/servicos/motorRegrasApi.js';

import './css-avaliacaoPsicossocial/cadastroAvaliacao.css';


//----------------- COMPONENTE ------------------------------//

function CadastroAvaliacao({ voltar, onSalvar, onSucesso }) {


    //----------------- DADOS DA AVALIAÇÃO ------------------//

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');

    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');


    //----------------- PÚBLICO E PRIVACIDADE ---------------//

    const [publicoSelecionado, setPublicoSelecionado] = useState('TODOS');

    const [anonimato, setAnonimato] = useState(0);

    const [setores, setSetores] = useState([]);
    const [cargos, setCargos] = useState([]);

    const [setoresSelecionados, setSetoresSelecionados] = useState([]);
    const [cargosSelecionados, setCargosSelecionados] = useState([]);


    //----------------- FATORES E PERGUNTAS -----------------//

    const [perguntas, setPerguntas] = useState([]);
    const [fatores, setFatores] = useState([]);

    const [fatoresSelecionados, setFatoresSelecionados] = useState([]);


    //----------------- REGRAS DO MOTOR ---------------------//

    const [regrasMotor, setRegrasMotor] = useState([]);

    const [regrasSelecionadas, setRegrasSelecionadas] = useState([]);


    //----------------- ESTADOS DA TELA ---------------------//

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState('');
    const [erroSalvar, setErroSalvar] = useState('');

    const [erros, setErros] = useState({});

    const [salvando, setSalvando] = useState(false);


    //----------------- CARREGAR DADOS ----------------------//

    useEffect(() => {

        async function carregarDados() {

            try {

                setCarregando(true);
                setErro('');

                const [
                    dadosPerguntas,
                    dadosSetores,
                    dadosCargos,
                    dadosRegras
                ] = await Promise.all([

                    buscarPerguntasAvaliacao(),

                    buscarSetoresAvaliacao(),

                    buscarCargosAvaliacao(),

                    buscarDadosMotorRegras()

                ]);


                //----------------- GUARDAR DADOS ----------------//

                setPerguntas(dadosPerguntas);
                setSetores(dadosSetores);
                setCargos(dadosCargos);
                setRegrasMotor(dadosRegras);


                //----------------- IDENTIFICAR FATORES ---------//

                const fatoresUnicos = dadosPerguntas.reduce(
                    (lista, pergunta) => {

                        const fator = pergunta.psicossocial_fator;

                        if (
                            fator &&
                            Number(fator.ativo) === 1 &&
                            !lista.some(
                                item => Number(item.id) === Number(fator.id)
                            )
                        ) {

                            lista.push(fator);

                        }

                        return lista;

                    },
                    []
                );


                //----------------- ORDENAR FATORES -------------//

                fatoresUnicos.sort(
                    (a, b) => Number(a.id) - Number(b.id)
                );

                setFatores(fatoresUnicos);

            } catch (erro) {

                console.error('Erro ao carregar dados do cadastro:', erro);

                setErro(
                    erro.message || 'Não foi possível carregar os dados.'
                );

            } finally {

                setCarregando(false);

            }

        }

        carregarDados();

    }, []);


    //----------------- LIMPAR ERROS ------------------------//

    function limparErro(campo) {

        setErros(anteriores => ({

            ...anteriores,

            [campo]: ''

        }));

    }


    //----------------- SELECIONAR FATOR --------------------//

    function alterarFator(idFator) {

        const id = Number(idFator);

        // Verifica se o fator já está selecionado.
        const novosFatores = fatoresSelecionados.includes(id)

            ? fatoresSelecionados.filter(item => item !== id)

            : [...fatoresSelecionados, id];


        // Atualiza os fatores da avaliação.
        setFatoresSelecionados(novosFatores);


        // Remove as regras dos fatores que foram desmarcados.
        setRegrasSelecionadas(anteriores =>

            anteriores.filter(regra =>

                novosFatores.includes(
                    Number(regra.id_psicossocial_fator)
                )

            )

        );


        limparErro('fatores');

    }


    //----------------- PERGUNTAS SELECIONADAS --------------//

    const perguntasSelecionadas = perguntas

        .filter(pergunta =>

            fatoresSelecionados.includes(
                Number(pergunta.psicossocial_fator?.id)
            )

        )

        .sort((a, b) => Number(a.ordem) - Number(b.ordem));


    //----------------- SALVAR AVALIAÇÃO --------------------//

    async function salvarAvaliacao() {

        if (salvando) {
            return;
        }


        //----------------- VALIDAÇÃO ------------------------//

        const novosErros = {};

        if (!titulo.trim()) {

            novosErros.titulo = 'Informe o título da avaliação.';

        }

        if (!dataInicio) {

            novosErros.dataInicio = 'Informe a data de início.';

        }

        if (!dataFim) {

            novosErros.dataFim = 'Informe a data de encerramento.';

        }

        if (dataInicio && dataFim && dataFim < dataInicio) {

            novosErros.dataFim =
                'A data final não pode ser anterior à inicial.';

        }

        if (
            publicoSelecionado === 'SETOR' &&
            setoresSelecionados.length === 0
        ) {

            novosErros.publico = 'Selecione pelo menos um setor.';

        }

        if (
            publicoSelecionado === 'CARGO' &&
            cargosSelecionados.length === 0
        ) {

            novosErros.publico = 'Selecione pelo menos um cargo.';

        }

        if (fatoresSelecionados.length === 0) {

            novosErros.fatores =
                'Selecione pelo menos um fator psicossocial.';

        }


        //----------------- VERIFICAR ERROS ------------------//

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }


        //----------------- DADOS DA AVALIAÇÃO ---------------//

        const dadosAvaliacao = {

            titulo: titulo.trim(),

            descricao: descricao.trim(),

            data_inicio: dataInicio,

            data_fim: dataFim,

            anonimo: Number(anonimato),

            // 0 = avaliação ainda não encerrada.
            status: 0,

            publico_selecionado: publicoSelecionado,

            setores_selecionados: setoresSelecionados,

            cargos_selecionados: cargosSelecionados,

            fatores_selecionados: fatoresSelecionados,

            // Regras escolhidas para cada fator.
            regras_selecionadas: regrasSelecionadas

        };


        //----------------- ENVIAR DADOS ---------------------//

        try {

            setSalvando(true);

            setErroSalvar('');

            // O componente pai realiza o cadastro na API.
            await onSalvar?.(dadosAvaliacao);

            // Só retorna à listagem depois do cadastro bem-sucedido.
            await onSucesso?.('Avaliação cadastrada com sucesso!');

        } catch (erro) {

            console.error('Erro ao salvar avaliação:', erro);

            // Mantém o cadastro aberto e mostra o erro.
            setErroSalvar(
                erro.message || 'Não foi possível cadastrar a avaliação.'
            );

        } finally {

            setSalvando(false);

        }

    }


    //----------------- CARREGAMENTO ------------------------//

    if (carregando) {

        return (

            <div className="cadastro-avaliacao-psicossocial">

                <p className="mensagem-carregamento-avaliacao">
                    Carregando dados do cadastro...
                </p>

            </div>

        );

    }


    //----------------- ERRO DE CARREGAMENTO ----------------//

    if (erro) {

        return (

            <div className="cadastro-avaliacao-psicossocial">

                <p className="erro-perguntas-avaliacao">
                    {erro}
                </p>

                <button
                    type="button"
                    onClick={voltar}
                >
                    Voltar para avaliações
                </button>

            </div>

        );

    }


    //----------------- TELA PRINCIPAL ----------------------//

    return (

        <div className="cadastro-avaliacao-psicossocial">


            {/* CABEÇALHO */}

            <div className="cabecalho-nova-avaliacao">

                <BotaoCadastro

                    titulo="Nova Avaliação Psicossocial"

                    descricao="Crie uma Avaliação para coletar percepções e opiniões dos colaboradores com total controle de público e anonimato."

                >

                    <nav className="caminho-cadastro-avaliacao">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Avaliação Psicossocial
                        </button>

                        <span className="seta">
                            &gt;
                        </span>

                        <span className="pagina-atual-avaliacao">
                            Nova Avaliação Psicossocial
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* ERRO AO CADASTRAR */}

            {erroSalvar && (

                <p
                    className="erro-cadastro-avaliacao"
                    role="alert"
                >
                    {erroSalvar}
                </p>

            )}


            {/* ETAPA 1 - IDENTIFICAÇÃO */}

            <section className="cartao-cadastro-avaliacao">

                <div className="cabecalho-etapa-avaliacao">

                    <div className="informacao-etapa-avaliacao">

                        <span className="numero-etapa-avaliacao">
                            01
                        </span>

                        <div>

                            <span className="legenda-etapa-avaliacao">
                                ETAPA 1
                            </span>

                            <h2>
                                Identificação da Avaliação
                            </h2>

                        </div>

                    </div>

                    <span className="status-etapa-avaliacao">
                        Preenchimento obrigatório
                    </span>

                </div>

                <IdentificacaoAvaliacao

                    titulo={titulo}
                    setTitulo={setTitulo}

                    descricao={descricao}
                    setDescricao={setDescricao}

                    dataInicio={dataInicio}
                    setDataInicio={setDataInicio}

                    dataFim={dataFim}
                    setDataFim={setDataFim}

                    anonimato={anonimato}
                    setAnonimato={setAnonimato}

                    erros={erros}
                    limparErro={limparErro}

                />

            </section>


            {/* ETAPA 2 - FATORES */}

            <section className="cartao-cadastro-avaliacao secao-fatores-avaliacao">

                <div className="cabecalho-etapa-avaliacao">

                    <div className="informacao-etapa-avaliacao">

                        <div>

                            <span className="legenda-etapa-avaliacao">
                                CONFIGURAÇÃO EM ABERTO
                            </span>

                            <h2>
                                Fatores Psicossociais a Avaliar
                            </h2>

                        </div>

                    </div>

                    <span className="contador-fatores-avaliacao">

                        {fatoresSelecionados.length} de {fatores.length} selecionados

                    </span>

                </div>


                <div className="lista-fatores-avaliacao">

                    {fatores.map(fator => {

                        const quantidadePerguntas = perguntas.filter(
                            pergunta =>

                                Number(pergunta.psicossocial_fator?.id) ===
                                Number(fator.id)

                        ).length;

                        return (

                            <CardFator

                                key={fator.id}

                                fator={fator}

                                selecionado={fatoresSelecionados.includes(
                                    Number(fator.id)
                                )}

                                onChange={() => alterarFator(fator.id)}

                                quantidadePerguntas={quantidadePerguntas}

                            />

                        );

                    })}

                </div>


                {erros.fatores && (

                    <p className="erro-perguntas-avaliacao">
                        {erros.fatores}
                    </p>

                )}


                <div className="rodape-fatores-avaliacao">

                    <span>
                        Selecione os fatores que farão parte da avaliação.
                    </span>

                </div>

            </section>


            {/* ETAPA 3 - PERGUNTAS */}

            <section className="cartao-cadastro-avaliacao secao-perguntas-avaliacao">

                <div className="cabecalho-etapa-avaliacao">

                    <div className="informacao-etapa-avaliacao">

                        <div>

                            <span className="legenda-etapa-avaliacao">
                                ETAPA 3 • VISUALIZAÇÃO PRÉVIA
                            </span>

                            <h2>
                                Perguntas Padronizadas dos Fatores Selecionados
                            </h2>

                            <p>
                                Confira as perguntas que serão apresentadas aos colaboradores.
                            </p>

                        </div>

                    </div>

                    <span className="contador-perguntas-avaliacao">
                        {perguntasSelecionadas.length} perguntas
                    </span>

                </div>

                <ListaPerguntas
                    perguntas={perguntasSelecionadas}
                />

            </section>


            {/* ETAPA 4 - REGRAS DO MOTOR */}

            <section className="cartao-cadastro-avaliacao secao-regras-avaliacao">

                <div className="cabecalho-etapa-avaliacao">

                    <div className="informacao-etapa-avaliacao">

                        <div>

                            <span className="legenda-etapa-avaliacao">
                                CONFIGURAÇÃO DAS REGRAS
                            </span>

                            <h2>
                                Regras do Motor de Regras
                            </h2>

                            <p>
                                Selecione as regras que serão utilizadas
                                para classificar os resultados dos fatores
                                desta avaliação.
                            </p>

                        </div>

                    </div>

                    <span className="contador-fatores-avaliacao">
                        {regrasSelecionadas.length} selecionadas
                    </span>

                </div>


                <SelecaoRegras

                    fatores={fatores}

                    fatoresSelecionados={fatoresSelecionados}

                    regras={regrasMotor}

                    regrasSelecionadas={regrasSelecionadas}

                    setRegrasSelecionadas={setRegrasSelecionadas}

                />

            </section>


            {/* ETAPA 5 - PÚBLICO E PRIVACIDADE */}

            <section className="cartao-cadastro-avaliacao secao-publico-avaliacao">

                <SelecaoPublico

                    publicoSelecionado={publicoSelecionado}
                    setPublicoSelecionado={setPublicoSelecionado}

                    setores={setores}
                    cargos={cargos}

                    setoresSelecionados={setoresSelecionados}
                    setSetoresSelecionados={setSetoresSelecionados}

                    cargosSelecionados={cargosSelecionados}
                    setCargosSelecionados={setCargosSelecionados}

                    anonimato={anonimato}
                    setAnonimato={setAnonimato}

                    limparErro={limparErro}
                    erro={erros.publico}

                />

            </section>


            {/* BOTÕES */}

            <div className="botoes-cadastro-avaliacao">

                <BotaoSalvarCancelar

                    onCancelar={voltar}

                    onSalvar={salvarAvaliacao}

                    salvando={salvando}

                    textoBotao="Salvar Avaliação"

                />

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroAvaliacao;
