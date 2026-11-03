
//----------------- IMPORTAÇÕES -----------------------------//

import { useState, useEffect } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import validarBeneficio from './funcoes/cadastroBeneficio/validarBeneficio.js';

import {
    cadastrarBeneficio,
    vincularBeneficioCargo,
    vincularBeneficioSetor
} from './servicos/cadastroBeneficioApi.js';

import {
    buscarSetoresBeneficio,
    buscarCargosBeneficio
} from './servicos/buscarDisponibilidadeBeneficio.js';

import './css-beneficios/cadastroBeneficio.css';


//----------------- COMPONENTE ------------------------------//

function CadastroBeneficio({ voltar }) {

    //----------------- ESTADOS DOS CAMPOS -------------------//

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');

    const [status, setStatus] = useState(1);

    const [disponibilidade, setDisponibilidade] = useState('TODOS');


    //----------------- SETORES E CARGOS ---------------------//

    const [setores, setSetores] = useState([]);
    const [cargos, setCargos] = useState([]);

    // Agora armazenamos objetos com ID e nome.
    const [itensSelecionados, setItensSelecionados] = useState([]);

    const [carregandoItens, setCarregandoItens] = useState(false);
    const [erroCarregamento, setErroCarregamento] = useState('');


    //----------------- ESTADOS DOS ERROS --------------------//

    const [erros, setErros] = useState({});

    const [salvando, setSalvando] = useState(false);


    //----------------- CARREGAR SETORES E CARGOS ------------//

    useEffect(() => {

        async function carregarDados() {

            setCarregandoItens(true);
            setErroCarregamento('');

            try {

                const [dadosSetores, dadosCargos] = await Promise.all([
                    buscarSetoresBeneficio(),
                    buscarCargosBeneficio()
                ]);

                setSetores(dadosSetores);
                setCargos(dadosCargos);

            } catch (erro) {

                console.error('Erro ao carregar setores e cargos:', erro);

                setErroCarregamento(
                    erro.message || 'Não foi possível carregar os setores e cargos.'
                );

            } finally {

                setCarregandoItens(false);

            }

        }

        carregarDados();

    }, []);


    //----------------- ITENS DISPONÍVEIS ---------------------//

    // Define qual lista será exibida de acordo com a disponibilidade.

    const itensDisponiveis = disponibilidade === 'SETOR'
        ? setores
        : cargos;


    //----------------- LIMPAR ERRO --------------------------//

    function limparErro(campo) {

        setErros((errosAtuais) => ({
            ...errosAtuais,
            [campo]: ''
        }));

    }


    //----------------- ALTERAR DISPONIBILIDADE --------------//

    function alterarDisponibilidade(valor) {

        setDisponibilidade(valor);

        // Limpa as seleções anteriores ao trocar a regra.
        setItensSelecionados([]);

        limparErro('disponibilidade');
        limparErro('itensSelecionados');

    }


    //----------------- SELECIONAR SETOR OU CARGO -------------//

    function selecionarItem(idSelecionado) {

        if (!idSelecionado) {
            return;
        }

        // Procura o registro selecionado na lista da API.
        const itemEncontrado = itensDisponiveis.find(
            (item) => Number(item.id) === Number(idSelecionado)
        );

        if (!itemEncontrado) {
            return;
        }

        // Verifica se o item já foi selecionado.
        const jaExiste = itensSelecionados.some(
            (item) => Number(item.id) === Number(itemEncontrado.id)
        );

        if (jaExiste) {
            return;
        }

        // Armazena o ID e o nome do registro.
        setItensSelecionados((itensAtuais) => [
            ...itensAtuais,
            {
                id: itemEncontrado.id,
                nome: itemEncontrado.nome
            }
        ]);

        limparErro('itensSelecionados');

    }


    //----------------- REMOVER SETOR OU CARGO ---------------//

    function removerItem(idRemover) {

        setItensSelecionados((itensAtuais) => {

            return itensAtuais.filter(
                (item) => Number(item.id) !== Number(idRemover)
            );

        });

    }


    //----------------- VALIDAR FORMULÁRIO -------------------//

    function validarFormulario() {

        const resultado = validarBeneficio({

            nome,
            descricao,
            status,
            disponibilidade,
            itensSelecionados

        });

        setErros(resultado.erros);

        return resultado.valido;

    }


    //----------------- SALVAR BENEFÍCIO ----------------------//




    async function salvarBeneficio() {

        // Evita dois cadastros simultâneos.
        if (salvando) {
            return;
        }

        // Verifica os campos antes de enviar.
        if (!validarFormulario()) {
            return;
        }

        setSalvando(true);

        try {

            //----------------- DADOS DO BENEFÍCIO ----------------//

            const dadosBeneficio = {
                nome: nome.trim(),
                descricao: descricao.trim(),
                status: Number(status),
                disponibilidade
            };


            //----------------- CADASTRAR BENEFÍCIO ---------------//

            const respostaBeneficio = await cadastrarBeneficio(
                dadosBeneficio
            );


            //----------------- RECUPERAR ID DO BENEFÍCIO ----------//

            // Aceita os formatos mais comuns de retorno da API.
            const idBeneficio =
                respostaBeneficio?.id_beneficio ??
                respostaBeneficio?.id ??
                respostaBeneficio?.beneficio?.id_beneficio ??
                respostaBeneficio?.beneficio?.id;

            if (!idBeneficio) {
                throw new Error(
                    'O benefício foi cadastrado, mas não foi possível identificar seu ID para criar os vínculos.'
                );
            }


            //----------------- VINCULAR AOS SETORES ---------------//

            if (disponibilidade === 'SETOR') {

                for (const setor of itensSelecionados) {

                    await vincularBeneficioSetor({
                        id_beneficio: Number(idBeneficio),
                        id_setor: Number(setor.id)
                    });

                }

            }


            //----------------- VINCULAR AOS CARGOS ----------------//

            if (disponibilidade === 'CARGO') {

                for (const cargo of itensSelecionados) {

                    await vincularBeneficioCargo({
                        id_beneficio: Number(idBeneficio),
                        id_cargo: Number(cargo.id)
                    });

                }

            }


            //----------------- SUCESSO ----------------------------//

            alert('Benefício cadastrado com sucesso!');

            voltar();


        } catch (erro) {

            console.error('Erro ao cadastrar benefício:', erro);

            alert(
                erro.message ||
                'Não foi possível cadastrar o benefício.'
            );

        } finally {

            setSalvando(false);

        }

    }



    //----------------- TÍTULOS -------------------------------//

    const tituloPagina = 'Novo Benefício';

    const descricaoPagina =
        'Defina os benefícios para organizar os colaboradores.';


    //----------------- TELA ----------------------------------//

    return (
        <>

            {/* CABEÇALHO */}

            <div className="cabecalho-novo-beneficio">

                <BotaoCadastro
                    titulo={tituloPagina}
                    descricao={descricaoPagina}
                >

                    <nav className="caminho-cadastro-beneficio">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Benefícios
                        </button>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-beneficio">
                            {tituloPagina}
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* IDENTIFICAÇÃO DO BENEFÍCIO */}

            <section className="cartao-identificacao-beneficio">

                <div className="cabecalho-cartao-beneficio">

                    <div>

                        <h2>Identificação do Benefício</h2>

                        <p>
                            Dados primários para exibição no portal e relatórios.
                        </p>

                    </div>

                    <span className="etiqueta-obrigatorio">
                        OBRIGATÓRIO
                    </span>

                </div>


                {/* NOME DO BENEFÍCIO */}

                <div className="campo-beneficio">

                    <div className="rotulo-campo-beneficio">

                        <label htmlFor="nome-beneficio">
                            Nome do benefício <span>*</span>
                        </label>

                        <small>Máximo 60 caracteres</small>

                    </div>

                    <input
                        id="nome-beneficio"
                        type="text"
                        placeholder="Ex: Vale-alimentação"
                        value={nome}
                        maxLength={60}
                        onChange={(evento) => {

                            setNome(evento.target.value);

                            limparErro('nome');

                        }}
                        className={
                            erros.nome ? 'campo-beneficio-erro' : ''
                        }
                    />

                    {erros.nome && (

                        <small className="mensagem-erro-beneficio">
                            {erros.nome}
                        </small>

                    )}

                </div>


                {/* DESCRIÇÃO DO BENEFÍCIO */}

                <div className="campo-beneficio">

                    <div className="rotulo-campo-beneficio">

                        <label htmlFor="descricao-beneficio">
                            Descrição do benefício <span>*</span>
                        </label>

                        <small>{descricao.length} / 300</small>

                    </div>

                    <textarea
                        id="descricao-beneficio"
                        placeholder="Descreva as informações principais deste benefício."
                        value={descricao}
                        maxLength={300}
                        onChange={(evento) => {

                            setDescricao(evento.target.value);

                            limparErro('descricao');

                        }}
                        className={
                            erros.descricao ? 'campo-beneficio-erro' : ''
                        }
                    />

                    {erros.descricao && (

                        <small className="mensagem-erro-beneficio">
                            {erros.descricao}
                        </small>

                    )}

                    <small className="ajuda-campo-beneficio">
                        Este texto será exibido como resumo na tela de benefícios do colaborador.
                    </small>

                </div>


                {/* STATUS OPERACIONAL */}

                <div className="campo-status-beneficio">

                    <label className="titulo-status-beneficio">
                        Status operacional <span>*</span>
                    </label>

                    <div className="opcoes-status-beneficio">

                        {/* STATUS ATIVO */}

                        <label
                            className={`opcao-status-beneficio ${Number(status) === 1 ? 'status-selecionado' : ''
                                }`}
                        >

                            <input
                                type="radio"
                                name="status-beneficio"
                                value="1"
                                checked={Number(status) === 1}
                                onChange={() => {

                                    setStatus(1);

                                    limparErro('status');

                                }}
                            />

                            <div>

                                <div className="titulo-opcao-status">

                                    <strong>Ativo</strong>

                                    <span className="status-disponivel">
                                        Liberado
                                    </span>

                                </div>

                                <p>
                                    Habilitado imediatamente para inclusão
                                    <br />
                                    na ficha e perfil dos colaboradores.
                                </p>

                            </div>

                        </label>


                        {/* STATUS INATIVO */}

                        <label
                            className={`opcao-status-beneficio ${Number(status) === 0 ? 'status-selecionado' : ''
                                }`}
                        >

                            <input
                                type="radio"
                                name="status-beneficio"
                                value="0"
                                checked={Number(status) === 0}
                                onChange={() => {

                                    setStatus(0);

                                    limparErro('status');

                                }}
                            />

                            <div>

                                <div className="titulo-opcao-status">

                                    <strong>Inativo</strong>

                                    <span className="status-bloqueado">
                                        Bloqueado
                                    </span>

                                </div>

                                <p>
                                    Ficará oculto para novas atribuições,
                                    <br />
                                    mantendo apenas vínculos passados.
                                </p>

                            </div>

                        </label>

                    </div>

                    {erros.status && (

                        <small className="mensagem-erro-beneficio">
                            {erros.status}
                        </small>

                    )}

                </div>

            </section>


            {/* REGRAS DE DISPONIBILIDADE */}

            <section className="cartao-disponibilidade-beneficio">

                <div className="cabecalho-cartao-beneficio">

                    <div>

                        <h2>Regras de Disponibilidade</h2>

                        <p>
                            Defina quem na organização é elegível para usufruir deste benefício.
                        </p>

                    </div>

                    <span className="etiqueta-obrigatorio">
                        OBRIGATÓRIO
                    </span>

                </div>


                <div className="opcoes-disponibilidade-beneficio">

                    {/* TODOS OS COLABORADORES */}

                    <label
                        className={`opcao-disponibilidade-beneficio ${disponibilidade === 'TODOS' ? 'disponibilidade-selecionada' : ''
                            }`}
                    >

                        <input
                            type="radio"
                            name="disponibilidade"
                            checked={disponibilidade === 'TODOS'}
                            onChange={() => alterarDisponibilidade('TODOS')}
                        />

                        <div className="conteudo-disponibilidade">

                            <strong>Todos os colaboradores</strong>

                            <p>
                                Qualquer colaborador ativo ou admitido na organização pode ser vinculado a este benefício.
                            </p>

                        </div>

                        {disponibilidade === 'TODOS' && (

                            <span className="etiqueta-padrao">
                                PADRÃO GERAL
                            </span>

                        )}

                    </label>


                    {/* SETORES ESPECÍFICOS */}

                    <label
                        className={`opcao-disponibilidade-beneficio ${disponibilidade === 'SETOR' ? 'disponibilidade-selecionada' : ''
                            }`}
                    >

                        <input
                            type="radio"
                            name="disponibilidade"
                            checked={disponibilidade === 'SETOR'}
                            onChange={() => alterarDisponibilidade('SETOR')}
                        />

                        <div className="conteudo-disponibilidade">

                            <strong>Setores específicos</strong>

                            <p>
                                Restrito aos colaboradores lotados em departamentos pré-selecionados.
                            </p>

                        </div>

                    </label>


                    {/* CARGOS ESPECÍFICOS */}

                    <label
                        className={`opcao-disponibilidade-beneficio ${disponibilidade === 'CARGO' ? 'disponibilidade-selecionada' : ''
                            }`}
                    >

                        <input
                            type="radio"
                            name="disponibilidade"
                            checked={disponibilidade === 'CARGO'}
                            onChange={() => alterarDisponibilidade('CARGO')}
                        />

                        <div className="conteudo-disponibilidade">

                            <strong>Cargos específicos</strong>

                            <p>
                                Vinculado a funções específicas do catálogo oficial de cargos.
                            </p>

                        </div>

                    </label>

                </div>


                {/* MENSAGEM DE ERRO DA DISPONIBILIDADE */}

                {erros.disponibilidade && (

                    <small className="mensagem-erro-beneficio">
                        {erros.disponibilidade}
                    </small>

                )}


                {/* SELEÇÃO DE SETORES OU CARGOS */}

                {disponibilidade !== 'TODOS' && (

                    <div className="selecao-itens-beneficio">

                        <div className="cabecalho-selecao-itens">

                            <strong>
                                {disponibilidade === 'SETOR'
                                    ? 'Setores selecionados'
                                    : 'Cargos selecionados'
                                }
                            </strong>

                            <small>
                                {itensSelecionados.length}{' '}
                                {disponibilidade === 'SETOR'
                                    ? 'setores selecionados'
                                    : 'cargos selecionados'
                                }
                            </small>

                        </div>


                        {/* ETIQUETAS DOS ITENS SELECIONADOS */}

                        <div className="lista-itens-beneficio">

                            {itensSelecionados.map((item) => (

                                <span
                                    className="item-selecionado-beneficio"
                                    key={item.id}
                                >



                                    {item.nome}

                                    <button
                                        type="button"
                                        onClick={() => removerItem(item.id)}
                                        aria-label={`Remover ${item.nome}`}
                                    >
                                        ×
                                    </button>

                                </span>

                            ))}


                            {/* SELECIONAR ITEM DA API */}

                            <div className="campo-adicionar-item-beneficio">

                                <select
                                    value=""
                                    onChange={(evento) => {
                                        selecionarItem(evento.target.value);
                                    }}
                                    disabled={carregandoItens || itensDisponiveis.length === 0}
                                >

                                    <option value="">
                                        {carregandoItens
                                            ? 'Carregando opções...'
                                            : disponibilidade === 'SETOR'
                                                ? '+ Adicionar setor'
                                                : '+ Adicionar cargo'
                                        }
                                    </option>

                                    {itensDisponiveis
                                        .filter((item) => {

                                            // Não exibe opções que já foram selecionadas.
                                            return !itensSelecionados.some(
                                                (selecionado) =>
                                                    Number(selecionado.id) === Number(item.id)
                                            );

                                        })
                                        .map((item) => (

                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nome}
                                            </option>

                                        ))
                                    }

                                </select>

                            </div>

                        </div>


                        {/* ERRO DE CARREGAMENTO */}

                        {erroCarregamento && (

                            <small className="mensagem-erro-beneficio">
                                {erroCarregamento}
                            </small>

                        )}

                        {/* ERRO DOS ITENS */}

                        {erros.itensSelecionados && (

                            <small className="mensagem-erro-beneficio">
                                {erros.itensSelecionados}
                            </small>

                        )}

                        {/* AVISO QUANDO NÃO EXISTEM REGISTROS */}

                        {!carregandoItens && !erroCarregamento && itensDisponiveis.length === 0 && (

                            <small className="ajuda-campo-beneficio">
                                Não existem {disponibilidade === 'SETOR' ? 'setores' : 'cargos'} ativos cadastrados.
                            </small>

                        )}

                    </div>

                )}

            </section>


            {/* BOTÕES */}

            <div className="botoes-cadastro-beneficio">

                <BotaoSalvarCancelar
                    onCancelar={voltar}
                    onSalvar={salvarBeneficio}
                    salvando={salvando}
                    textoBotao="Salvar benefício"
                />

            </div>

        </>
    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroBeneficio;
