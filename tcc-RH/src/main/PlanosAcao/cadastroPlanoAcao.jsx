//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import DadosPlanoAcao from './componentes/DadosPlanoAcao.jsx';
import ResponsavelPlano from './componentes/ResponsavelPlano.jsx';
import ListaTarefasPlano from './componentes/ListaTarefasPlano.jsx';

import {
    cadastrarPlanoAcao,
    listarFatoresPsicossociais
} from './servicos/planosAcaoApi.js';

import './css-planoAcao/cadastroPlanoAcao.css';


//----------------- CONFIGURAÇÃO DA API --------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- COMPONENTE PRINCIPAL -------------------//

function CadastroPlanoAcao({ voltar }) {

    //----------------- ESTADOS -----------------------------//

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [objetivo, setObjetivo] = useState('');

    const [idSetor, setIdSetor] = useState('');
    const [idColaborador, setIdColaborador] = useState('');
    const [idFator, setIdFator] = useState('');

    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const [setores, setSetores] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [fatores, setFatores] = useState([]);

    const [tarefas, setTarefas] = useState([]);

    const [tituloTarefa, setTituloTarefa] = useState('');
    const [descricaoTarefa, setDescricaoTarefa] = useState('');

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    // Guarda o ID caso o plano seja criado,
    // mas alguma tarefa falhe.
    const [idPlanoCriado, setIdPlanoCriado] = useState(null);


    //----------------- AUTENTICAÇÃO ------------------------//

    function obterConfiguracao() {

        const token = localStorage.getItem('access_token');

        if (!token) {
            throw new Error(
                'Sessão expirada. Faça login novamente.'
            );
        }

        return {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
    }


    //----------------- CARREGAR DADOS ---------------------//

    useEffect(() => {

        async function carregarDados() {

            try {

                setCarregando(true);
                setErro('');

                const configuracao = obterConfiguracao();

                const [
                    respostaSetores,
                    respostaColaboradores,
                    listaFatores
                ] = await Promise.all([

                    fetch(`${API}/setor`, {
                        method: 'GET',
                        ...configuracao
                    }),

                    fetch(`${API}/colaborador`, {
                        method: 'GET',
                        ...configuracao
                    }),

                    listarFatoresPsicossociais()

                ]);

                const dadosSetores =
                    await respostaSetores.json();

                const dadosColaboradores =
                    await respostaColaboradores.json();

                if (
                    respostaSetores.status === 401 ||
                    respostaColaboradores.status === 401
                ) {

                    localStorage.removeItem('access_token');

                    throw new Error(
                        'Sua sessão expirou. Faça login novamente.'
                    );

                }

                if (
                    !respostaSetores.ok ||
                    !respostaColaboradores.ok
                ) {

                    throw new Error(
                        'Não foi possível carregar os setores e colaboradores.'
                    );

                }

                setSetores(
                    dadosSetores.response?.setor || []
                );

                const listaColaboradores =
                    dadosColaboradores.response?.colaborador || [];

                // Exibe somente colaboradores ativos.
                setColaboradores(
                    listaColaboradores.filter((colaborador) => {

                        return (
                            colaborador.status === 'Ativo' ||
                            Number(colaborador.status) === 1
                        );

                    })
                );

                // Carrega os fatores psicossociais.
                setFatores(listaFatores);

            } catch (error) {

                setErro(
                    error.message ||
                    'Não foi possível carregar os dados do cadastro.'
                );

            } finally {

                setCarregando(false);

            }

        }

        carregarDados();

    }, []);


    //----------------- ADICIONAR TAREFA --------------------//

    function adicionarTarefa() {

        const titulo = tituloTarefa.trim();
        const descricao = descricaoTarefa.trim();

        if (!titulo || !descricao) {
            return;
        }

        setTarefas((tarefasAtuais) => [

            ...tarefasAtuais,

            {
                id: `${Date.now()}-${tarefasAtuais.length}`,
                titulo,
                descricao
            }

        ]);

        setTituloTarefa('');
        setDescricaoTarefa('');
        setErro('');

    }

    function moverTarefa(indice, direcao) {

        const novoIndice = indice + direcao;

        setTarefas((tarefasAtuais) => {

            if (
                novoIndice < 0 ||
                novoIndice >= tarefasAtuais.length
            ) {
                return tarefasAtuais;
            }

            const novasTarefas = [...tarefasAtuais];

            const tarefaAtual = novasTarefas[indice];

            novasTarefas[indice] = novasTarefas[novoIndice];

            novasTarefas[novoIndice] = tarefaAtual;

            return novasTarefas;

        });

    }


    //----------------- REMOVER TAREFA ----------------------//

    function removerTarefa(id) {

        setTarefas((tarefasAtuais) =>

            tarefasAtuais.filter(
                (tarefa) => tarefa.id !== id
            )

        );

    }


    //----------------- VALIDAR FORMULÁRIO ------------------//

    const formularioValido = Boolean(

        titulo.trim() &&
        descricao.trim() &&
        objetivo.trim() &&
        idSetor &&
        idFator &&
        dataInicio &&
        dataFim &&
        dataFim >= dataInicio &&
        tarefas.length > 0

    );


    //----------------- CADASTRAR TAREFAS -------------------//

    async function cadastrarTarefas(idPlano) {

        const configuracao = obterConfiguracao();

        for (
            let indice = 0;
            indice < tarefas.length;
            indice++
        ) {

            const tarefa = tarefas[indice];

            const resposta = await fetch(
                `${API}/tarefa_plano`,
                {

                    method: 'POST',

                    ...configuracao,

                    body: JSON.stringify({

                        id_plano_acao: Number(idPlano),

                        descricao: JSON.stringify({

                            titulo: tarefa.titulo,

                            descricao: tarefa.descricao

                        }),

                        ordem: indice + 1,

                        // 0 = tarefa em andamento.
                        status: 0

                    })

                }
            );

            let dados;

            try {
                dados = await resposta.json();
            } catch {
                dados = {};
            }

            if (resposta.status === 401) {

                localStorage.removeItem('access_token');

                throw new Error(
                    'Sua sessão expirou. Faça login novamente.'
                );

            }

            if (!resposta.ok || dados.status === false) {

                throw new Error(

                    dados.message ||
                    dados.mensagem ||
                    `Não foi possível cadastrar a tarefa "${tarefa.descricao}".`

                );

            }

        }

    }


    //----------------- SALVAR PLANO ------------------------//

    async function salvarPlano() {

        if (!formularioValido && !idPlanoCriado) {

            setErro(
                'Preencha os campos obrigatórios e adicione pelo menos uma tarefa.'
            );

            return;

        }

        try {

            setSalvando(true);

            setErro('');
            setSucesso('');


            //----------------- CRIAR PLANO ------------------//

            let idPlano = idPlanoCriado;

            if (!idPlano) {

                const dadosPlano = {

                    id_setor: Number(idSetor),

                    id_psicossocial_fator: Number(idFator),

                    titulo: titulo.trim(),

                    descricao: descricao.trim(),

                    objetivo: objetivo.trim(),

                    data_inicio: dataInicio,

                    data_fim: dataFim,

                    // 0 = plano ativo/em andamento.
                    status: 0

                };

                // Responsável é opcional.
                if (idColaborador) {

                    dadosPlano.id_colaborador =
                        Number(idColaborador);

                }

                const resultado = await cadastrarPlanoAcao(
                    dadosPlano
                );

                const planoCriado =
                    resultado.response?.plano_acao ||
                    resultado.response?.planoAcao ||
                    resultado.response ||
                    resultado;

                idPlano =
                    planoCriado.id ||
                    planoCriado.insertId ||
                    resultado.id;

                if (!idPlano) {

                    throw new Error(
                        'O plano foi cadastrado, mas a API não retornou o ID.'
                    );

                }

                setIdPlanoCriado(idPlano);

            }


            //----------------- CRIAR TAREFAS ----------------//

            await cadastrarTarefas(idPlano);


            //----------------- FINALIZAÇÃO ------------------//

            setSucesso(
                'Plano de ação e tarefas cadastrados com sucesso!'
            );

            voltar();

        } catch (error) {

            console.error(
                'Erro ao cadastrar plano de ação:',
                error
            );

            setErro(
                error.message ||
                'Não foi possível cadastrar o plano de ação.'
            );

        } finally {

            setSalvando(false);

        }

    }


    //----------------- CARREGAMENTO ------------------------//

    if (carregando) {

        return (

            <div className="cadastro-plano-acao">

                <p className="mensagem-carregamento-plano">
                    Carregando dados do cadastro...
                </p>

            </div>

        );

    }


    //----------------- TELA DE CADASTRO --------------------//

    return (

        <div className="cadastro-plano-acao">

            {/* CABEÇALHO */}

            <div className="cabecalho-cadastro-plano">

                <BotaoCadastro

                    titulo="Novo Plano de Ação"

                    descricao="Organize as medidas necessárias, defina responsáveis e acompanhe as tarefas do plano."

                >

                    <nav className="caminho-cadastro-plano">

                        <button
                            type="button"
                            onClick={voltar}
                            disabled={salvando}
                        >
                            Plano de Ação
                        </button>

                        <span className="seta">
                            &gt;
                        </span>

                        <span className="pagina-atual-plano">
                            Novo Plano
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* FORMULÁRIO */}

            <div className="formulario-cadastro-plano">

                {/* DADOS PRINCIPAIS */}

                <DadosPlanoAcao

                    titulo={titulo}
                    setTitulo={setTitulo}

                    descricao={descricao}
                    setDescricao={setDescricao}

                    objetivo={objetivo}
                    setObjetivo={setObjetivo}

                    idSetor={idSetor}
                    setIdSetor={setIdSetor}
                    setores={setores}

                    idFator={idFator}
                    setIdFator={setIdFator}
                    fatores={fatores}

                    dataInicio={dataInicio}
                    setDataInicio={setDataInicio}

                    dataFim={dataFim}
                    setDataFim={setDataFim}

                    desabilitado={Boolean(idPlanoCriado)}

                />

                <ListaTarefasPlano

                    tarefas={tarefas}

                    tituloTarefa={tituloTarefa}
                    setTituloTarefa={setTituloTarefa}

                    descricaoTarefa={descricaoTarefa}
                    setDescricaoTarefa={setDescricaoTarefa}

                    adicionarTarefa={adicionarTarefa}
                    removerTarefa={removerTarefa}
                    moverTarefa={moverTarefa}

                    desabilitado={Boolean(idPlanoCriado)}

                />


                {/* RESPONSÁVEL */}
                <ResponsavelPlano

                    idColaborador={idColaborador}
                    setIdColaborador={setIdColaborador}

                    colaboradores={colaboradores}

                    dataInicio={dataInicio}
                    setDataInicio={setDataInicio}

                    dataFim={dataFim}
                    setDataFim={setDataFim}

                    desabilitado={Boolean(idPlanoCriado)}

                />





                {/* MENSAGENS */}

                {erro && (

                    <div className="mensagem-erro-cadastro-plano">
                        {erro}
                    </div>

                )}

                {sucesso && (

                    <div className="mensagem-sucesso-cadastro-plano">
                        {sucesso}
                    </div>

                )}


                {/* BOTÕES */}

                <BotaoSalvarCancelar

                    voltar={voltar}

                    salvando={salvando}

                    formularioValido={
                        formularioValido || Boolean(idPlanoCriado)
                    }

                    onSalvar={salvarPlano}

                    textoBotao={
                        idPlanoCriado
                            ? 'Finalizar cadastro'
                            : 'Salvar plano'
                    }

                />

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO -----------------------------//

export default CadastroPlanoAcao;