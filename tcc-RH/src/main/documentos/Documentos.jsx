
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Alerta from '../../componentes/cardAlerta/alerta.jsx';
import AlertaNotificacao from '../../componentes/alerta/Alerta.jsx';

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

    const [telaAtual, setTelaAtual] = useState('lista');

    // Controla as notificações de sucesso e erro.
    const [alertaNotificacao, setAlertaNotificacao] = useState({
        tipo: '',
        mensagem: ''
    });


    //----------------- ESTADOS DA VISUALIZAÇÃO -------------//

    const [documentoSelecionado, setDocumentoSelecionado] = useState(null);

    const [urlDocumento, setUrlDocumento] = useState('');

    const [tipoArquivo, setTipoArquivo] = useState('');

    const [carregandoArquivo, setCarregandoArquivo] = useState(false);

    const [erroVisualizacao, setErroVisualizacao] = useState('');


    //----------------- ESTADOS DO ARQUIVAMENTO -------------//

    const [documentoParaArquivar, setDocumentoParaArquivar] = useState(null);

    const [mostrarAlertaArquivamento, setMostrarAlertaArquivamento] = useState(false);

    const [carregandoArquivamento, setCarregandoArquivamento] = useState(false);


    //----------------- ESTADOS DO DESARQUIVAMENTO ----------//

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


    //----------------- CONTROLAR NOTIFICAÇÃO ----------------//

    function exibirNotificacao(tipo, mensagem) {

        setAlertaNotificacao({
            tipo,
            mensagem
        });

    }


    function fecharNotificacao() {

        setAlertaNotificacao({
            tipo: '',
            mensagem: ''
        });

    }


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

        fecharNotificacao();

        setTelaAtual('cadastro');

    }


    //----------------- FINALIZAR CADASTRO ------------------//

    async function concluirCadastro(mensagem) {

        setTelaAtual('lista');

        setFiltros({
            pesquisa: '',
            status: 'Todos',
            opcao: ''
        });

        await carregarDados();

        exibirNotificacao('sucesso', mensagem);

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

        const idDocumento = documento.id_documento || documento.id;

        if (!idDocumento) {

            exibirNotificacao(
                'erro',
                'Não foi possível identificar o documento.'
            );

            return;

        }

        setDocumentoSelecionado(documento);

        setCarregandoArquivo(true);
        setErroVisualizacao('');
        setUrlDocumento('');
        setTipoArquivo('');

        try {

            const arquivo = await buscarArquivoDocumento(idDocumento);

            const url = URL.createObjectURL(arquivo);

            const caminho = documento.caminho_arquivo || '';

            const extensao = caminho.includes('.')
                ? caminho.split('.').pop().toLowerCase()
                : '';

            let tipo = arquivo.type;

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

        if (urlDocumento) {

            URL.revokeObjectURL(urlDocumento);

        }

        setDocumentoSelecionado(null);
        setUrlDocumento('');
        setTipoArquivo('');
        setErroVisualizacao('');
        setCarregandoArquivo(false);

    }


    //----------------- SOLICITAR ARQUIVAMENTO --------------//

    function prepararArquivamento() {

        setDocumentoParaArquivar(documentoSelecionado);

        fecharVisualizacao();

        setMostrarAlertaArquivamento(true);

    }


    //----------------- CANCELAR ARQUIVAMENTO ----------------//

    function cancelarArquivamento() {

        if (carregandoArquivamento) {
            return;
        }

        setMostrarAlertaArquivamento(false);

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

            await alterarStatusDocumento(documentoParaArquivar, 0);

            setMostrarAlertaArquivamento(false);

            setDocumentoParaArquivar(null);

            await carregarDados();

            exibirNotificacao(
                'sucesso',
                'Documento arquivado com sucesso!'
            );

        } catch (error) {

            console.error('Erro ao arquivar documento:', error);

            setErro(
                error.message || 'Não foi possível arquivar o documento.'
            );

        } finally {

            setCarregandoArquivamento(false);

        }

    }


    //----------------- DESARQUIVAR DOCUMENTO ----------------//

    async function desarquivarDocumentoSelecionado() {

        if (!documentoSelecionado || carregandoDesarquivamento) {
            return;
        }

        try {

            setCarregandoDesarquivamento(true);
            setErroVisualizacao('');

            await alterarStatusDocumento(documentoSelecionado, 1);

            fecharVisualizacao();

            await carregarDados();

            exibirNotificacao(
                'sucesso',
                'Documento desarquivado com sucesso!'
            );

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

        const caminho = documentoSelecionado.caminho_arquivo || '';

        const extensao = caminho.includes('.')
            ? caminho.split('.').pop().toLowerCase()
            : '';

        const nomeArquivo = extensao
            ? `${documentoSelecionado.nome || 'documento'}.${extensao}`
            : `${documentoSelecionado.nome || 'documento'}`;

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
                onSucesso={concluirCadastro}
            />

        );

    }


    //----------------- TELA PRINCIPAL -----------------------//

    return (

        <div className="pagina-documentos">


            {/* NOTIFICAÇÃO DE SUCESSO OU ERRO */}

            <AlertaNotificacao
                tipo={alertaNotificacao.tipo}
                mensagem={alertaNotificacao.mensagem}
                onFechar={fecharNotificacao}
            />


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
