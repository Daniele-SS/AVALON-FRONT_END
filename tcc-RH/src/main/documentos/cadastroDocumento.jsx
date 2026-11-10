
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useMemo, useRef, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/BotaoSalvarCancelar.jsx';

import { cadastrarDocumento } from './servicos/cadastroDocumentoApi.js';
import buscarDadosColaboradores from '../colaboradores/servicos/colaboradoresApi.js';

import './css-documentos/cadastroDocumento.css';


//----------------- COMPONENTE PRINCIPAL --------------------//

function CadastroDocumento({ voltar }) {

    //----------------- ESTADOS ----------------------------//

    const [nome, setNome] = useState('');
    const [tipoDocumento, setTipoDocumento] = useState('');
    const [idColaborador, setIdColaborador] = useState('');
    const [arquivo, setArquivo] = useState(null);

    const [ativo, setAtivo] = useState(true);

    const [colaboradores, setColaboradores] = useState([]);

    const [carregandoColaboradores, setCarregandoColaboradores] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [pesquisaColaborador, setPesquisaColaborador] = useState('');
    const [mostrarOpcoesColaborador, setMostrarOpcoesColaborador] = useState(false);

    const [erro, setErro] = useState('');
    const [erroArquivo, setErroArquivo] = useState('');

    const inputArquivo = useRef(null);
    const dropdownRef = useRef(null);


    //----------------- TIPOS DE DOCUMENTOS ----------------//

    const tiposDocumento = [
        'Contrato',
        'Termo',
        'Aditivo Contratual',
        'Comunicação',
        'Recibo',
        'Avaliação',
        'Documento',
        'Política',
        'Advertência',
        'Rescisão',
        'Outros'
    ];


    //----------------- CARREGAR COLABORADORES --------------//

    async function carregarColaboradores() {

        try {

            setCarregandoColaboradores(true);

            const resposta = await buscarDadosColaboradores();

            setColaboradores(
                resposta?.colaboradores || []
            );

        } catch (error) {

            console.error('Erro ao carregar colaboradores:', error);

            setErro('Não foi possível carregar os colaboradores.');

        } finally {

            setCarregandoColaboradores(false);

        }

    }


    //----------------- CARREGAMENTO INICIAL ----------------//

    useEffect(() => {

        carregarColaboradores();

    }, []);


    //----------------- FECHAR DROPDOWN AO CLICAR FORA -------//

    useEffect(() => {

        function fecharDropdown(event) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {

                setMostrarOpcoesColaborador(false);

            }

        }

        document.addEventListener('mousedown', fecharDropdown);

        return () => {

            document.removeEventListener('mousedown', fecharDropdown);

        };

    }, []);


    //----------------- FORMATAR TEXTO DA PESQUISA -----------//

    function normalizarTexto(texto) {

        return String(texto || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

    }


    //----------------- FILTRAR COLABORADORES ----------------//

    const colaboradoresFiltrados = useMemo(() => {

        const pesquisa = normalizarTexto(pesquisaColaborador);

        return colaboradores.filter((colaborador) => {

            // Considera somente colaboradores ativos.

            const status = String(colaborador?.status ?? '').toLowerCase();

            const colaboradorAtivo =
                status === 'ativo' ||
                status === '1';

            if (!colaboradorAtivo) {
                return false;
            }

            // Pesquisa pelo nome.

            const nomeColaborador = normalizarTexto(
                colaborador.nome
            );

            // Pesquisa pela matrícula.

            const matriculaColaborador = normalizarTexto(
                colaborador.matricula ??
                colaborador.numero_matricula ??
                ''
            );

            return (
                nomeColaborador.includes(pesquisa) ||
                matriculaColaborador.includes(pesquisa)
            );

        });

    }, [colaboradores, pesquisaColaborador]);


    //----------------- GERAR INICIAIS DO COLABORADOR --------//

    function gerarIniciais(nomeColaborador) {

        const partesNome = String(nomeColaborador || '')
            .trim()
            .split(' ')
            .filter(Boolean);

        if (partesNome.length === 0) {
            return '--';
        }

        if (partesNome.length === 1) {
            return partesNome[0].substring(0, 2).toUpperCase();
        }

        return (
            partesNome[0][0] +
            partesNome[partesNome.length - 1][0]
        ).toUpperCase();

    }


    //----------------- SELECIONAR COLABORADOR ----------------//

    function selecionarColaborador(colaborador) {

        const id = colaborador.id_colaborador ?? colaborador.id;

        setIdColaborador(String(id));

        setPesquisaColaborador(colaborador.nome);

        setMostrarOpcoesColaborador(false);

        setErro('');

    }


    //----------------- ALTERAR PESQUISA DO COLABORADOR ------//

    function alterarPesquisaColaborador(valor) {

        setPesquisaColaborador(valor);

        setIdColaborador('');

        setMostrarOpcoesColaborador(true);

        setErro('');

    }


    //----------------- SELECIONAR ARQUIVO -------------------//

    function selecionarArquivo(event) {

        const arquivoSelecionado = event.target.files[0];

        if (!arquivoSelecionado) {
            return;
        }

        const extensoesPermitidas = [
            'pdf',
            'doc',
            'docx',
            'jpg',
            'jpeg',
            'png'
        ];

        const extensao = arquivoSelecionado.name
            .split('.')
            .pop()
            .toLowerCase();

        const tamanhoMaximo = 25 * 1024 * 1024;

        if (!extensoesPermitidas.includes(extensao)) {

            setErroArquivo(
                'Formato inválido. Selecione PDF, DOC, DOCX, JPG ou PNG.'
            );

            event.target.value = '';

            return;

        }

        if (arquivoSelecionado.size > tamanhoMaximo) {

            setErroArquivo(
                'O arquivo ultrapassa o tamanho máximo permitido de 25 MB.'
            );

            event.target.value = '';

            return;

        }

        setArquivo(arquivoSelecionado);

        setErroArquivo('');

        setErro('');

    }


    //----------------- ABRIR SELETOR DE ARQUIVO -------------//

    function abrirSeletorArquivo() {

        inputArquivo.current?.click();

    }


    //----------------- REMOVER ARQUIVO ---------------------//

    function removerArquivo() {

        setArquivo(null);

        setErroArquivo('');

        if (inputArquivo.current) {
            inputArquivo.current.value = '';
        }

    }


    //----------------- FORMATAR TAMANHO DO ARQUIVO ----------//

    function formatarTamanhoArquivo(tamanho) {

        if (tamanho < 1024 * 1024) {

            return `${(tamanho / 1024).toFixed(1)} KB`;

        }

        return `${(tamanho / (1024 * 1024)).toFixed(2)} MB`;

    }


    //----------------- VALIDAR FORMULÁRIO ------------------//

    const formularioValido = Boolean(
        nome.trim() &&
        tipoDocumento &&
        idColaborador &&
        arquivo &&
        !erroArquivo
    );


    //----------------- SALVAR DOCUMENTO --------------------//


//----------------- SALVAR DOCUMENTO --------------------//

async function salvarDocumento() {

    if (!formularioValido) {

        setErro('Preencha todos os campos obrigatórios e selecione um arquivo válido.');

        return;

    }

    try {

        setSalvando(true);

        setErro('');

        // Cria o formulário para enviar os dados e o arquivo físico.
        const dadosDocumento = new FormData();

        // Adiciona os dados do documento.
        dadosDocumento.append('id_colaborador', Number(idColaborador));

        dadosDocumento.append('nome', nome.trim());

        dadosDocumento.append('tipo_documento', tipoDocumento);

        dadosDocumento.append('ativo', ativo ? 1 : 0);

        // Adiciona o arquivo físico selecionado pelo usuário.
        // O nome do campo precisa ser igual ao uploadDocumento.single('arquivo').
        dadosDocumento.append('arquivo', arquivo);

        // Envia os dados para a API.
        await cadastrarDocumento(dadosDocumento);

        alert('Documento cadastrado com sucesso!');

        voltar();

    } catch (error) {

        console.error('Erro ao cadastrar documento:', error);

        setErro(
            error.message || 'Não foi possível cadastrar o documento.'
        );

    } finally {

        setSalvando(false);

    }

}



    //----------------- CANCELAR CADASTRO -------------------//

    function cancelarCadastro() {

        voltar();

    }


    //----------------- COMPONENTE VISUAL -------------------//

    return (

        <div className="pagina-cadastro-documento">


            {/* CABEÇALHO */}

            <div className="cabecalho-novo-documento">

                <BotaoCadastro
                    titulo="Novo Documento"
                >

                    <nav className="caminho-cadastro-documento">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Documentos
                        </button>

                        <span className="seta">
                            &gt;
                        </span>

                        <span className="pagina-atual-documento">
                            Novo Documento
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* MENSAGEM DE ERRO */}

            {erro && (

                <div className="erro-cadastro-documento">

                    {erro}

                </div>

            )}


            {/* CARTÃO DE INFORMAÇÕES */}

            <section className="cartao-informacoes-documento">

                <div className="cabecalho-cartao-documento">

                    <div>

                        <h2>Informações do documento</h2>

                    </div>

                    <span className="etiqueta-obrigatorio-documento">
                        OBRIGATÓRIO
                    </span>

                </div>


                <div className="grade-campos-documento">


                    {/* NOME DO DOCUMENTO */}

                    <div className="campo-documento">

                        <label htmlFor="nome-documento">
                            Nome do documento
                            <span>*</span>
                        </label>

                        <input
                            id="nome-documento"
                            type="text"
                            placeholder="Ex.: Contrato de Trabalho"
                            value={nome}
                            onChange={(event) => setNome(event.target.value)}
                            maxLength={150}
                        />

                    </div>


                    {/* TIPO DO DOCUMENTO */}

                    <div className="campo-documento">

                        <label htmlFor="tipo-documento">
                            Tipo de documento
                            <span>*</span>
                        </label>

                        <select
                            id="tipo-documento"
                            value={tipoDocumento}
                            onChange={(event) => setTipoDocumento(event.target.value)}
                        >

                            <option value="">
                                Selecione o tipo
                            </option>

                            {tiposDocumento.map((tipo) => (

                                <option
                                    key={tipo}
                                    value={tipo}
                                >
                                    {tipo}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* COLABORADOR COM PESQUISA */}

                    <div
                        className="campo-documento campo-documento-completo"
                        ref={dropdownRef}
                    >

                        <label htmlFor="colaborador-documento">
                            Colaborador
                            <span>*</span>
                        </label>


                        {/* CAMPO DE PESQUISA */}

                        <div
                            className={`campo-pesquisa-colaborador-documento ${
                                mostrarOpcoesColaborador ? 'campo-pesquisa-documento-foco' : ''
                            }`}
                        >

                            <span className="icone-pesquisa-colaborador-documento">
                                ⌕
                            </span>

                            <input
                                id="colaborador-documento"
                                type="text"
                                placeholder={
                                    carregandoColaboradores
                                        ? 'Carregando colaboradores...'
                                        : 'Digite o nome ou matrícula do colaborador'
                                }
                                value={pesquisaColaborador}
                                onChange={(event) => alterarPesquisaColaborador(event.target.value)}
                                onFocus={() => setMostrarOpcoesColaborador(true)}
                                disabled={carregandoColaboradores}
                                autoComplete="off"
                            />

                            {idColaborador && (

                                <span className="status-colaborador-documento">
                                    <span className="ponto-status-documento" />
                                    Ativo
                                </span>

                            )}

                            <span className="seta-dropdown-colaborador-documento">
                                {mostrarOpcoesColaborador ? '⌃' : '⌄'}
                            </span>

                        </div>


                        {/* DROPDOWN DE OPÇÕES */}

                        {mostrarOpcoesColaborador && !carregandoColaboradores && (

                            <div className="dropdown-colaboradores-documento">

                                {colaboradoresFiltrados.length > 0 ? (

                                    colaboradoresFiltrados.map((colaborador) => {

                                        const id = String(
                                            colaborador.id_colaborador ?? colaborador.id
                                        );

                                        const matricula =
                                            colaborador.matricula ??
                                            colaborador.numero_matricula ??
                                            '';

                                        return (

                                            <button
                                                key={id}
                                                type="button"
                                                className={`opcao-colaborador-documento ${
                                                    id === idColaborador
                                                        ? 'opcao-colaborador-selecionada'
                                                        : ''
                                                }`}
                                                onClick={() => selecionarColaborador(colaborador)}
                                            >

                                                <span className="icone-opcao-colaborador-documento">

                                                    {gerarIniciais(colaborador.nome)}

                                                </span>

                                                <span className="dados-opcao-colaborador-documento">

                                                    <strong>
                                                        {colaborador.nome}
                                                    </strong>

                                                    <span>
                                                        {matricula
                                                            ? `Matrícula: ${matricula}`
                                                            : 'Colaborador'
                                                        }
                                                    </span>

                                                </span>

                                                {id === idColaborador && (

                                                    <span className="check-colaborador-documento">
                                                        ✓
                                                    </span>

                                                )}

                                            </button>

                                        );

                                    })

                                ) : (

                                    <div className="nenhum-colaborador-documento">

                                        Nenhum colaborador encontrado.

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </div>

            </section>


            {/* CARTÃO DO ARQUIVO */}

            <section className="cartao-arquivo-documento">

                <div className="cabecalho-cartao-documento">

                    <div>

                        <h2>Arquivo do Documento</h2>

                        <p>
                            Selecione o arquivo que será associado ao cadastro.
                        </p>

                    </div>

                </div>


                <input
                    ref={inputArquivo}
                    type="file"
                    className="input-arquivo-documento"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={selecionarArquivo}
                />


                {arquivo ? (

                    <div className="arquivo-selecionado-documento">

                        <div className="informacoes-arquivo-documento">

                            <div className="icone-arquivo-documento">

                                <span>
                                    {arquivo.name.split('.').pop().toUpperCase()}
                                </span>

                            </div>

                            <div className="dados-arquivo-documento">

                                <strong>{arquivo.name}</strong>

                                <span>
                                    {formatarTamanhoArquivo(arquivo.size)}
                                </span>

                            </div>

                        </div>


                        <div className="acoes-arquivo-documento">

                            <button
                                type="button"
                                className="botao-substituir-arquivo"
                                onClick={abrirSeletorArquivo}
                            >
                                Substituir arquivo
                            </button>

                            <button
                                type="button"
                                className="botao-remover-arquivo"
                                onClick={removerArquivo}
                            >
                                Remover
                            </button>

                        </div>

                    </div>

                ) : (

                    <div
                        className="area-selecionar-arquivo"
                        onClick={abrirSeletorArquivo}
                        onKeyDown={(event) => {

                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                abrirSeletorArquivo();
                            }

                        }}
                        role="button"
                        tabIndex={0}
                    >

                        <div className="icone-selecao-arquivo">
                            <span>↑</span>
                        </div>

                        <strong>
                            Clique para selecionar um arquivo
                        </strong>

                        <p>
                            PDF, DOC, DOCX, JPG ou PNG
                        </p>

                        <span>
                            Tamanho máximo: 25 MB
                        </span>

                    </div>

                )}


                {erroArquivo && (

                    <p className="erro-arquivo-documento">
                        {erroArquivo}
                    </p>

                )}


                <p className="observacoes-arquivo-documento">
                    Selecione um arquivo para associá-lo ao documento cadastrado.
                </p>

            </section>


            {/* CARTÃO DE GOVERNANÇA */}

            <section className="cartao-governanca-documento">

                <div className="cabecalho-governanca-documento">

                    <div>

                        <h2>Governança do Documento</h2>

                        <p>
                            Defina a disponibilidade deste documento no sistema.
                        </p>

                    </div>

                    <span className="numero-governanca-documento">
                        01
                    </span>

                </div>


                <div className="opcao-disponibilizacao-documento">

                    <div className="texto-disponibilizacao-documento">

                        <strong>Documento ativo</strong>

                        <p>
                            Quando ativo, o documento ficará disponível no sistema.
                        </p>

                    </div>


                    <button
                        type="button"
                        className={`interruptor-documento ${ativo ? 'interruptor-ativo' : ''}`}
                        onClick={() => setAtivo(!ativo)}
                        aria-label={ativo ? 'Desativar documento' : 'Ativar documento'}
                        aria-pressed={ativo}
                    >

                        <span />

                    </button>

                </div>

            </section>


            {/* BOTÕES */}

            <div className="botoes-cadastro-documento">

                <BotaoSalvarCancelar
                    onCancelar={cancelarCadastro}
                    onSalvar={salvarDocumento}
                    salvando={salvando}
                    formularioValido={formularioValido}
                    textoBotao="Salvar Documento"
                />

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroDocumento;
