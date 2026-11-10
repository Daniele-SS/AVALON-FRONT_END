
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Alerta from '../../componentes/cardAlerta/alerta.jsx';

import buscarDocumentos, {
    buscarArquivoDocumento,
    alterarStatusDocumento
} from './servicos/documentosApi.js';

import ListaDocumentos from './componentes/ListaDocumento.jsx';
import JanelaVisualizacaoDocumento from './componentes/JanelaVisualizacaoDocumento.jsx';

import CadastroDocumento from './cadastroDocumento.jsx';

import calcularIndicadoresDocumentos from './funcoes/documento/calcularIndicadoresDocumentos.js';
import montarInformacoesDocumentos from './funcoes/documento/montarInformacoesDocumentos.js';
import filtrarDocumentos from './funcoes/documento/filtrarDocumentos.js';

import './css-documentos/documentos.css';


//----------------- COMPONENTE PRINCIPAL --------------------//

function Documentos() {

    //----------------- ESTADOS ----------------------------//

    const [documentos, setDocumentos] = useState([]);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Controla qual tela será exibida.
    const [telaAtual, setTelaAtual] = useState('lista');


    //----------------- ESTADOS DA VISUALIZAÇÃO -------------//

    const [documentoSelecionado, setDocumentoSelecionado] = useState(null);

    const [urlDocumento, setUrlDocumento] = useState('');

    const [tipoArquivo, setTipoArquivo] = useState('');

    const [carregandoArquivo, setCarregandoArquivo] = useState(false);

    const [erroVisualizacao, setErroVisualizacao] = useState('');


    //----------------- ESTADOS DO ARQUIVAMENTO -------------//

    // Guarda o documento que será arquivado.
    const [documentoParaArquivar, setDocumentoParaArquivar] = useState(null);

    // Controla a abertura do alerta.
    const [mostrarAlertaArquivamento, setMostrarAlertaArquivamento] = useState(false);

    // Controla o carregamento do arquivamento.
    const [carregandoArquivamento, setCarregandoArquivamento] = useState(false);


    //----------------- ESTADOS DO DESARQUIVAMENTO ----------//

    // Controla o carregamento do desarquivamento.
    const [carregandoDesarquivamento, setCarregandoDesarquivamento] = useState(false);


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


    //----------------- CARREGAR DOCUMENTOS ----------------//

    async function carregarDados() {

        try {

            setCarregando(true);
            setErro('');

            const dados = await buscarDocumentos();

            setDocumentos(dados);

        } catch (error) {

            console.error('Erro ao carregar documentos:', error);

            setErro(
                error.message || 'Não foi possível carregar os documentos.'
            );

        } finally {

            setCarregando(false);

        }

    }


    //----------------- CARREGAMENTO INICIAL ----------------//

    useEffect(() => {

        carregarDados();

    }, []);


    //----------------- INDICADORES -------------------------//

    const indicadores = calcularIndicadoresDocumentos(documentos);

    const informacoes = montarInformacoesDocumentos(indicadores);


    //----------------- FILTRAR DOCUMENTOS ------------------//

    const documentosFiltrados = filtrarDocumentos(
        documentos,
        filtros
    );


    //----------------- ATUALIZAR FILTROS -------------------//

    function atualizarFiltros(novosFiltros) {

        setFiltros({
            pesquisa: novosFiltros.pesquisa || '',
            status: novosFiltros.status || 'Todos',
            opcao: novosFiltros.opcao || ''
        });

    }


    //----------------- ABRIR CADASTRO -----------------------//

    function novoDocumento() {

        setTelaAtual('cadastro');

    }


    //----------------- VOLTAR PARA LISTAGEM -----------------//

    async function voltarParaLista() {

        setTelaAtual('lista');

        setFiltros({
            pesquisa: '',
            status: 'Todos',
            opcao: ''
        });

        await carregarDados();

    }


    //----------------- VISUALIZAR DOCUMENTO ----------------//

    async function visualizarDocumento(documento) {

        // Recupera o identificador do documento.
        const idDocumento = documento.id_documento || documento.id;

        if (!idDocumento) {

            alert('Não foi possível identificar o documento.');

            return;

        }

        // Abre a janela imediatamente.
        setDocumentoSelecionado(documento);

        // Prepara os estados da visualização.
        setCarregandoArquivo(true);
        setErroVisualizacao('');
        setUrlDocumento('');
        setTipoArquivo('');

        try {

            // Busca o arquivo físico na API.
            const arquivo = await buscarArquivoDocumento(idDocumento);

            // Cria uma URL temporária para exibir o arquivo.
            const url = URL.createObjectURL(arquivo);

            // Identifica a extensão do arquivo.
            const caminho = documento.caminho_arquivo || '';

            const extensao = caminho.includes('.')
                ? caminho.split('.').pop().toLowerCase()
                : '';

            let tipo = arquivo.type;

            // Identifica o formato caso a API não informe o MIME.
            if (!tipo || tipo === 'application/octet-stream') {

                if (extensao === 'pdf') {

                    tipo = 'application/pdf';

                } else if (
                    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extensao)
                ) {

                    tipo = 'imagem';

                } else if (['doc', 'docx'].includes(extensao)) {

                    tipo = 'word';

                } else if (['xls', 'xlsx', 'csv'].includes(extensao)) {

                    tipo = 'excel';

                } else if (['ppt', 'pptx'].includes(extensao)) {

                    tipo = 'powerpoint';

                }

            }

            // Atualiza os dados para exibição.
            setTipoArquivo(tipo);
            setUrlDocumento(url);

        } catch (error) {

            console.error('Erro ao visualizar documento:', error);

            setErroVisualizacao(
                error.message || 'Não foi possível visualizar o documento.'
            );

        } finally {

            setCarregandoArquivo(false);

        }

    }


    //----------------- FECHAR VISUALIZAÇÃO ----------------//

    function fecharVisualizacao() {

        // Libera a URL temporária do arquivo.
        if (urlDocumento) {

            URL.revokeObjectURL(urlDocumento);

        }

        // Limpa os estados da janela.
        setDocumentoSelecionado(null);
        setUrlDocumento('');
        setTipoArquivo('');
        setErroVisualizacao('');
        setCarregandoArquivo(false);

    }


    //----------------- SOLICITAR ARQUIVAMENTO --------------//

    function prepararArquivamento() {

        // Guarda o documento selecionado antes de fechar a visualização.
        setDocumentoParaArquivar(documentoSelecionado);

        // Fecha a pré-visualização.
        fecharVisualizacao();

        // Abre o alerta de confirmação.
        setMostrarAlertaArquivamento(true);

    }


    //----------------- CANCELAR ARQUIVAMENTO ----------------//

    function cancelarArquivamento() {

        if (carregandoArquivamento) {
            return;
        }

        // Fecha o alerta sem alterar o documento.
        setMostrarAlertaArquivamento(false);

        // Limpa o documento selecionado para arquivamento.
        setDocumentoParaArquivar(null);

    }


    //----------------- CONFIRMAR ARQUIVAMENTO ---------------//

    async function confirmarArquivamento() {

        if (!documentoParaArquivar || carregandoArquivamento) {
            return;
        }

        try {

            setCarregandoArquivamento(true);
            setErro('');

            // Altera o status para arquivado (0).
            await alterarStatusDocumento(documentoParaArquivar, 0);

            // Fecha o alerta.
            setMostrarAlertaArquivamento(false);

            // Limpa o documento selecionado.
            setDocumentoParaArquivar(null);

            // Atualiza a listagem e os indicadores.
            await carregarDados();

        } catch (error) {

            console.error('Erro ao arquivar documento:', error);

            setErro(
                error.message || 'Não foi possível arquivar o documento.'
            );

        } finally {

            setCarregandoArquivamento(false);

        }

    }


    //----------------- DESARQUIVAR DOCUMENTO IMEDIATAMENTE ----------------//

    async function desarquivarDocumentoSelecionado() {

        if (!documentoSelecionado || carregandoDesarquivamento) {
            return;
        }

        try {

            setCarregandoDesarquivamento(true);
            setErroVisualizacao('');

            // Altera o status para ativo (1), sem abrir alerta.
            await alterarStatusDocumento(documentoSelecionado, 1);

            // Fecha a janela de visualização.
            fecharVisualizacao();

            // Atualiza a listagem e os indicadores.
            await carregarDados();

        } catch (error) {

            console.error('Erro ao desarquivar documento:', error);

            setErroVisualizacao(
                error.message || 'Não foi possível desarquivar o documento.'
            );

        } finally {

            setCarregandoDesarquivamento(false);

        }

    }


    //----------------- BAIXAR DOCUMENTO --------------------//

    function baixarDocumento() {

        if (!urlDocumento || !documentoSelecionado) {
            return;
        }

        // Recupera a extensão original.
        const caminho = documentoSelecionado.caminho_arquivo || '';

        const extensao = caminho.includes('.')
            ? caminho.split('.').pop().toLowerCase()
            : '';

        // Monta o nome do arquivo para o download.
        const nomeArquivo = extensao
            ? `${documentoSelecionado.nome || 'documento'}.${extensao}`
            : `${documentoSelecionado.nome || 'documento'}`;

        // Cria um link temporário para baixar o arquivo.
        const link = document.createElement('a');

        link.href = urlDocumento;
        link.download = nomeArquivo;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    }


    //----------------- LIBERAR URL AO DESMONTAR -------------//

    useEffect(() => {

        return () => {

            if (urlDocumento) {

                URL.revokeObjectURL(urlDocumento);

            }

        };

    }, [urlDocumento]);


    //----------------- TELA DE CADASTRO ---------------------//

    if (telaAtual === 'cadastro') {

        return (

            <CadastroDocumento
                voltar={voltarParaLista}
            />

        );

    }


    //----------------- TELA PRINCIPAL -----------------------//

    return (

        <div className="pagina-documentos">


            {/* CABEÇALHO DA PÁGINA */}

            <BotaoCadastro
                titulo="Documentos"
                descricao="Centralize, organize e audite os arquivos e comprovantes dos colaboradores em um repositório corporativo unificado."
                textoBotao="Novo Documento"
                onClick={novoDocumento}
            />


            {/* MINICARDS */}

            <div className="indicadores-documentos">

                {informacoes.map((informacao) => (

                    <Minicards
                        key={informacao.id}
                        icone={informacao.icone}
                        numero={informacao.numero}
                        informacao={informacao.informacao}
                        corFundo={informacao.corFundo}
                        layout="horizontal"
                    />

                ))}

            </div>


            {/* FILTROS */}

            <div className="filtros-documentos">

                <Filtro
                    titulo="Pesquisar Documento"
                    placeholder="Pesquisar por nome, colaborador ou tipo..."
                    nomeDropdown="Tipo de Documento"
                    opcoesDropdown={tiposDocumento}
                    onFiltrosChange={atualizarFiltros}
                />

            </div>


            {/* CONTEÚDO */}

            <div className="conteudo-documentos">


                {/* CARREGAMENTO */}

                {carregando && (

                    <div className="mensagem-documentos">

                        <p>Carregando documentos...</p>

                    </div>

                )}


                {/* ERRO */}

                {!carregando && erro && (

                    <div className="erro-documentos">

                        <p>{erro}</p>

                        <button
                            type="button"
                            onClick={carregarDados}
                        >
                            Tentar novamente
                        </button>

                    </div>

                )}


                {/* LISTAGEM */}

                {!carregando && !erro && (

                    <ListaDocumentos
                        documentos={documentosFiltrados}
                        onVisualizar={visualizarDocumento}
                    />

                )}

            </div>


            {/* JANELA DE VISUALIZAÇÃO DO DOCUMENTO */}

            {documentoSelecionado && (

                <JanelaVisualizacaoDocumento
                    documento={documentoSelecionado}
                    urlDocumento={urlDocumento}
                    tipoArquivo={tipoArquivo}
                    carregando={carregandoArquivo}
                    erro={erroVisualizacao}
                    onFechar={fecharVisualizacao}
                    onBaixar={baixarDocumento}
                    onArquivar={prepararArquivamento}
                    onDesarquivar={desarquivarDocumentoSelecionado}
                    carregandoDesarquivamento={carregandoDesarquivamento}
                />

            )}


            {/* ALERTA DE CONFIRMAÇÃO DE ARQUIVAMENTO */}

            <Alerta
                aberto={mostrarAlertaArquivamento}
                titulo="Arquivar documento?"
                entidade="documento"
                mensagem="Tem certeza de que deseja arquivar este documento? Ele deixará de aparecer entre os documentos ativos."
                informacoes={[
                    {
                        titulo: 'Documento',
                        valor: documentoParaArquivar?.nome || 'Documento'
                    }
                ]}
                textoBotao="Arquivar"
                carregando={carregandoArquivamento}
                cancelar={cancelarArquivamento}
                confirmar={confirmarArquivamento}
            />

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Documentos;
