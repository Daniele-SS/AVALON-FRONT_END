
 //----------------- IMPORTAÇÕES -----------------------------//

 import { useEffect, useState } from 'react';

 import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
 import Minicards from '../../componentes/minicard/minicard.jsx';
 import Filtro from '../../componentes/cardFiltros/filtros.jsx';
 import Tabela from '../../componentes/cardTabela/tabela.jsx';
 
 //import CadastroFerias from './cadastroFerias.jsx';
 //import EditarFerias from './editarFerias.jsx';
 
 import CardSolicitacao from './componentes/solicitacao/cardSolicitacao.jsx';
 
 import '../../componentes/cardNomePag/nomePag.css';
 import './css-ferias/ferias.css';
 
 import buscarDadosFerias from './servicos/ferias.js';
 
 import { calcularIndicadoresFerias } from './funcoes/ferias/calcularIndicadoresFerias.js';
 import montarInformacoesFerias from './funcoes/ferias/montarInformacoesFerias.js';
 import filtrarFerias from './funcoes/ferias/filtrarFerias.js';
 import criarColunasFerias from './funcoes/ferias/colunaFerias.jsx';
 
 import CalendarioIcone from './img/calendario-icon.svg';
 import CaixaIcone from './img/caixa-icon.svg';
 import ConfereIcone from './img/confere-icon.svg';
 import GuardaSolIcone from './img/guardaSol-icon.svg';
 
 
 //----------------- COMPONENTE -------------------------------//
 
 function Ferias() {
 
     //----------------- ESTADOS ------------------------------//
 
     const [ferias, setFerias] = useState([]);
 
     const [filtros, setFiltros] = useState({
         pesquisa: '',
         status: 'Todos',
         opcao: ''
     });
 
     const [tela, setTela] = useState('lista');
 
     const [feriasSelecionadas, setFeriasSelecionadas] = useState(null);
 
     const [carregando, setCarregando] = useState(true);
 
     const [erro, setErro] = useState('');
 
 
     //----------------- CARREGAR DADOS ------------------------//
 
     async function carregarDados() {
 
         setCarregando(true);
         setErro('');
 
         try {
 
             const dados = await buscarDadosFerias();
 
             setFerias(dados.ferias || []);
 
         } catch (erro) {
 
             setErro(
                 erro.message || 'Não foi possível carregar as férias.'
             );
 
         } finally {
 
             setCarregando(false);
 
         }
 
     }
 
 
     //----------------- CARREGAR AO ABRIR ---------------------//
 
     useEffect(() => {
 
         carregarDados();
 
     }, []);
 
 
     //----------------- NAVEGAÇÃO ------------------------------//
 
     function abrirCadastro() {
 
         setTela('cadastro');
 
     }
 
     function abrirEdicao(feriasItem) {
 
         setFeriasSelecionadas(feriasItem);
 
         setTela('edicao');
 
     }
 
     function voltarParaLista() {
 
         setTela('lista');
 
         setFeriasSelecionadas(null);
 
         carregarDados();
 
     }
 
 
     //----------------- ATUALIZAR FILTROS ----------------------//
 
     function atualizarFiltros(novosFiltros) {
 
         setFiltros(novosFiltros);
 
     }
 
 
     //----------------- PREPARAR DADOS -------------------------//
 
     const feriasComInformacoes = montarInformacoesFerias(ferias);
 
 
     //----------------- FILTRAR DADOS --------------------------//
 
     const feriasFiltradas = filtrarFerias(
         feriasComInformacoes,
         filtros
     );
 
 
     //----------------- COLUNAS DA TABELA ----------------------//
 
     const colunas = criarColunasFerias(abrirEdicao);
 
 
     //----------------- INDICADORES ----------------------------//
 
     const {
         programado,
         emFeriasHoje,
         proximos30Dias,
         finalizadasNoAno
     } = calcularIndicadoresFerias(ferias);
 
 
     //----------------- SOLICITAÇÕES PENDENTES -----------------//
 
     const solicitacoes = feriasComInformacoes
         .filter(feriasItem =>
             feriasItem.status?.toLowerCase() === 'pendente'
         )
         .map(feriasItem => {
 
             const colaborador = Array.isArray(feriasItem.colaborador)
                 ? feriasItem.colaborador[0] || {}
                 : feriasItem.colaborador || {};
 
             return {
 
                 id: feriasItem.id,
 
                 nome: feriasItem.nome_colaborador,
 
                 codigo: colaborador.matricula || colaborador.id || '---',
 
                 foto: null,
 
                 setor: feriasItem.nome_setor,
 
                 gestor: 'Não informado',
 
                 gestorCargo: 'Gestor',
 
                 periodo:
                     `${feriasItem.data_inicio_formatada} – ${feriasItem.data_fim_formatada}`,
 
                 duracao: feriasItem.quantidade_dias,
 
                 dataAbertura: null,
 
                 status: feriasItem.status
 
             };
 
         });
 
 
     //----------------- AÇÕES DAS SOLICITAÇÕES ----------------//
 
     function analisarSolicitacao(solicitacao) {
 
         abrirEdicao(solicitacao);
 
     }
 
     function verTodasSolicitacoes() {
 
         setFiltros({
             pesquisa: '',
             status: 'Todos',
             opcao: 'Pendente'
         });
 
     }
 
 
     //----------------- TELA DE CADASTRO -----------------------//
 
     if (tela === 'cadastro') {
 
         return (
             <CadastroFerias
                 voltar={voltarParaLista}
             />
         );
 
     }
 
 
     //----------------- TELA DE EDIÇÃO -------------------------//
 
     if (tela === 'edicao') {
 
         return (
             <EditarFerias
                 ferias={feriasSelecionadas}
                 voltar={voltarParaLista}
             />
         );
 
     }
 
 
     //----------------- TELA PRINCIPAL -------------------------//
 
     return (
 
         <div className="pagina-ferias">
 
             {/* Cabeçalho */}
 
             <BotaoCadastro
                 titulo="Férias"
                 descricao="Consulte e gerencie os períodos de férias dos colaboradores."
                 textoBotao="Nova Férias"
                 onClick={abrirCadastro}
             />
 
 
             {/* Minicards */}
 
             <div className="minicard-ferias">
 
                 <Minicards
                     icone={CalendarioIcone}
                     numero={programado}
                     informacao="FÉRIAS PROGRAMADAS"
                     corFundo="#DBE1FF"
                     layout="vertical"
                 />
 
                 <Minicards
                     icone={GuardaSolIcone}
                     numero={emFeriasHoje}
                     informacao="EM FÉRIAS HOJE"
                     corFundo="#6FFBBE"
                     layout="vertical"
                 />
 
                 <div className="minicard-proximos-30">
 
                     <Minicards
                         icone={CaixaIcone}
                         numero={proximos30Dias}
                         informacao="FÉRIAS NOS PRÓXIMOS 30 DIAS"
                         corFundo="#E2E7FF"
                         layout="vertical"
                     />
 
                 </div>
 
                 <Minicards
                     icone={ConfereIcone}
                     numero={finalizadasNoAno}
                     informacao="FINALIZADAS NO ANO"
                     corFundo="#EAEDFF"
                     layout="vertical"
                 />
 
             </div>
 
 
             {/* Solicitações */}
 
             <CardSolicitacao
                 solicitacoes={solicitacoes}
                 onAnalisar={analisarSolicitacao}
                 onVerTodas={verTodasSolicitacoes}
             />
 
 
             {/* Filtros */}
 
             <Filtro
                 titulo="Pesquisar Férias"
                 placeholder="Buscar por nome, matrícula ou setor"
                 nomeDropdown="Status"
                 mostrarStatus={false}
                 opcoesDropdown={[
                     { id: 'Pendente', nome: 'Pendente' },
                     {
                         id: 'Aprovado pelo Gestor',
                         nome: 'Aprovado pelo Gestor'
                     },
                     {
                         id: 'Aprovado pelo RH',
                         nome: 'Aprovado pelo RH'
                     },
                     {
                         id: 'Recusado pelo Gestor',
                         nome: 'Recusado pelo Gestor'
                     },
                     {
                         id: 'Recusado pelo RH',
                         nome: 'Recusado pelo RH'
                     }
                 ]}
                 onFiltrosChange={atualizarFiltros}
             />
 
 
             {/* Erro */}
 
             {erro && (
 
                 <p className="mensagem-erro-ferias">
                     {erro}
                 </p>
 
             )}
 
 
             {/* Tabela */}
 
             {carregando ? (
 
                 <p>Carregando férias...</p>
 
             ) : (
 
                 <Tabela
                     titulo="Lista de Férias"
                     dados={feriasFiltradas}
                     colunas={colunas}
                 />
 
             )}
 
         </div>
 
     );
 
 }
 
 
 //----------------- EXPORTAÇÃO ------------------------------//
 
 export default Ferias;
 