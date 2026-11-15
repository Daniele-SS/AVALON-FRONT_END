
 //----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import AlertaNotificacao from '../../componentes/alerta/Alerta.jsx';

import CadastroRegra from './cadastroRegra.jsx';
import AcaoRegra from './acaoRegras.jsx';

import CardRegra from './componentes/CardRegra.jsx';

import buscarDadosMotorRegras, {
    alterarStatusRegra,
    excluirRegra
} from './servicos/motorRegrasApi.js';

import filtrarRegras from './funcoes/regra/filtrarRegras.js';
import montarInformacoesRegras from './funcoes/regra/montarInformacoesRegras.js';

import './css-motorRegras/motorRegras.css';

import AtencaoIcone from './img/atencao-icon.svg';
import IdentificadaIcone from './img/identificada-icon.svg';
import PrioridadeIcone from './img/prioridade-icon.svg';
import RegraAtivaIcone from './img/regraAtiva-icon.svg';


//----------------- COMPONENTE ------------------------------//

function MotorRegras() {

    //----------------- ESTADOS -----------------------------//

    const [regras, setRegras] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [telaAtual, setTelaAtual] = useState('lista');

    const [dadosCondicao, setDadosCondicao] = useState(null);

    const [erro, setErro] = useState('');

    // Controla as notificações.
    const [alertaNotificacao, setAlertaNotificacao] = useState(null);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: '',
        classificacao: 'Todos'
    });


    //----------------- NOTIFICAÇÕES -------------------------//

    function exibirNotificacao(tipo, mensagem) {

        setAlertaNotificacao({
            tipo,
            mensagem
        });

    }

    function fecharNotificacao() {

        setAlertaNotificacao(null);

    }


    //----------------- BUSCAR DADOS -------------------------//

    async function carregarDados() {

        setCarregando(true);

        setErro('');

        try {

            const dados = await buscarDadosMotorRegras();

            setRegras(dados);

        } catch (erroApi) {

            console.error(
                'Erro ao buscar regras:',
                erroApi
            );

            setErro(
                erroApi.message ||
                'Não foi possível carregar as regras.'
            );

        } finally {

            setCarregando(false);

        }

    }


    //----------------- CARREGAMENTO INICIAL -----------------//

    useEffect(() => {

        carregarDados();

    }, []);


//----------------- ATIVAR / DESATIVAR REGRA --------------//

async function atualizarStatusRegra(id, ativo) {

    try {

        const regra = regras.find(
            (item) => String(item.id) === String(id)
        );

        if (!regra) {
            throw new Error('Regra não encontrada.');
        }

        await alterarStatusRegra(
            id,
            ativo,
            regra
        );

        setRegras((regrasAtuais) =>

            regrasAtuais.map((item) =>

                String(item.id) === String(id)

                    ? { ...item, ativo: ativo ? 1 : 0 }

                    : item

            )

        );

    } catch (erroApi) {

        console.error(
            'Erro ao alterar status da regra:',
            erroApi
        );

    }

}


    //----------------- EXCLUIR REGRA -------------------------//

    async function removerRegra(id) {

        const confirmar = window.confirm(
            'Tem certeza que deseja excluir esta regra?'
        );

        if (!confirmar) {
            return;
        }

        try {

            await excluirRegra(id);

            await carregarDados();

            exibirNotificacao(
                'sucesso',
                'Regra excluída com sucesso!'
            );

        } catch (erroApi) {

            console.error(
                'Erro ao excluir regra:',
                erroApi
            );

            exibirNotificacao(
                'erro',
                erroApi.message ||
                'Não foi possível excluir a regra.'
            );

        }

    }


    //----------------- INDICADORES --------------------------//

    const informacoes = montarInformacoesRegras(regras);


    //----------------- OPÇÕES DOS FATORES ------------------//

    const opcoesFatores = [

        ...new Map(

            regras.map((regra) => {

                const fator = regra.fator_psicossocial
                    ?.psicossocialFator;

                return [

                    String(fator?.id),

                    {
                        id: String(fator?.id),
                        nome: fator?.nome || 'Fator não identificado'
                    }

                ];

            })

        ).values()

    ];


    //----------------- FILTRAR REGRAS -----------------------//

    const regrasFiltradas = filtrarRegras(
        regras,
        filtros
    );


    //----------------- RECEBER FILTROS ---------------------//

    function receberFiltros(novosFiltros) {

        setFiltros((filtrosAtuais) => ({

            ...filtrosAtuais,

            pesquisa: novosFiltros.pesquisa || '',

            status: novosFiltros.status || 'Todos',

            opcao: novosFiltros.opcao || '',

            classificacao:

                novosFiltros.pesquisa === '' &&
                novosFiltros.status === 'Todos' &&
                novosFiltros.opcao === ''

                    ? 'Todos'

                    : filtrosAtuais.classificacao

        }));

    }


    //----------------- CLASSIFICAÇÃO ------------------------//

    function alterarClassificacao(evento) {

        setFiltros((filtrosAtuais) => ({

            ...filtrosAtuais,

            classificacao: evento.target.value

        }));

    }


    //----------------- INICIAR CADASTRO ---------------------//

    function novaRegra() {

        setDadosCondicao(null);

        setTelaAtual('condicao');

    }


    //----------------- RECEBER CONDIÇÃO ---------------------//

    function receberCondicao(dados) {

        setDadosCondicao(dados);

        setTelaAtual('acao');

    }


    //----------------- VOLTAR PARA CONDIÇÃO ------------------//

    function voltarParaCondicao() {

        setTelaAtual('condicao');

    }


    //----------------- VOLTAR PARA LISTAGEM -----------------//

    function voltarCadastro() {

        setDadosCondicao(null);

        setTelaAtual('lista');

    }


    //----------------- FINALIZAR CADASTRO -------------------//

    async function finalizarCadastro(mensagem) {

        setDadosCondicao(null);

        setTelaAtual('lista');

        await carregarDados();

        exibirNotificacao(
            'sucesso',
            mensagem || 'Regra cadastrada com sucesso!'
        );

    }


    //----------------- EXIBIR PRIMEIRA ETAPA ----------------//

    if (telaAtual === 'condicao') {

        return (

            <CadastroRegra

                voltar={voltarCadastro}

                continuar={receberCondicao}

            />

        );

    }


    //----------------- EXIBIR SEGUNDA ETAPA -----------------//

    if (telaAtual === 'acao') {

        return (

            <AcaoRegra

                voltar={voltarCadastro}

                voltarParaCondicao={voltarParaCondicao}

                concluir={finalizarCadastro}

                condicao={dadosCondicao}

            />

        );

    }


    //----------------- TELA PRINCIPAL -----------------------//

    return (

        <>

            {/* NOTIFICAÇÃO */}

            {alertaNotificacao && (

                <AlertaNotificacao

                    tipo={alertaNotificacao.tipo}

                    mensagem={alertaNotificacao.mensagem}

                    onFechar={fecharNotificacao}

                />

            )}


            {/* CABEÇALHO */}

            <BotaoCadastro

                titulo="Motor de Regras"

                descricao="Automatize a identificação de situações que precisam de atenção."

                textoBotao="Nova Regra"

                onClick={novaRegra}

            />


            {/* INDICADORES */}

            <div className="indicadores-motor-regras">

                <Minicards

                    icone={RegraAtivaIcone}

                    numero={
                        carregando ? '—' : informacoes.totalRegras
                    }

                    informacao="Regras cadastradas"

                    corFundo="#E8EDFF"

                    layout="horizontal"

                />

                <Minicards

                    icone={IdentificadaIcone}

                    numero={
                        carregando ? '—' : informacoes.regrasAtivas
                    }

                    informacao="Regras em operação"

                    corFundo="#E8EDFF"

                    layout="horizontal"

                />

                <Minicards

                    icone={AtencaoIcone}

                    numero={
                        carregando ? '—' : informacoes.regrasAtencao
                    }

                    informacao="Regras de atenção"

                    corFundo="#DCE8FF"

                    layout="horizontal"

                />

                <Minicards

                    icone={PrioridadeIcone}

                    numero={
                        carregando ? '—' : informacoes.regrasPrioridade
                    }

                    informacao="Regras de prioridade"

                    corFundo="#FFDAD7"

                    layout="horizontal"

                />

            </div>


            {/* FILTROS */}

            <div className="filtros-motor-regras">

                <Filtro

                    titulo="Pesquisar Regra"

                    placeholder="Buscar por fator ou ação"

                    nomeDropdown="Fator"

                    opcoesDropdown={opcoesFatores}

                    onFiltrosChange={receberFiltros}

                />


                {/* FILTRO DE CLASSIFICAÇÃO */}

                <div className="filtro-classificacao-regra">

                    <label htmlFor="classificacao-regra">
                        Classificação:
                    </label>

                    <select

                        id="classificacao-regra"

                        value={filtros.classificacao}

                        onChange={alterarClassificacao}

                    >

                        <option value="Todos">
                            Todas
                        </option>

                        <option value="NORMAL">
                            Normal
                        </option>

                        <option value="ATENÇÃO">
                            Atenção
                        </option>

                        <option value="PRIORIDADE">
                            Prioridade
                        </option>

                    </select>

                </div>

            </div>


            {/* LISTA DE REGRAS */}

            <div className="lista-motor-regras">

                {carregando && (

                    <p>Carregando regras...</p>

                )}


                {!carregando && erro && (

                    <div className="mensagem-erro-regras">

                        <p>{erro}</p>

                        <button
                            type="button"
                            onClick={carregarDados}
                        >

                            Tentar novamente

                        </button>

                    </div>

                )}


                {!carregando &&
                    !erro &&
                    regrasFiltradas.length === 0 && (

                        <p className="mensagem-vazia-regras">

                            Nenhuma regra encontrada.

                        </p>

                    )}


                {!carregando &&
                    !erro &&
                    regrasFiltradas.length > 0 && (

                        <div className="grade-motor-regras">

                            {regrasFiltradas.map((regra) => (

                                <CardRegra

                                    key={regra.id}

                                    regra={regra}

                                    onAlterarStatus={atualizarStatusRegra}

                                    onExcluir={removerRegra}

                                />

                            ))}

                        </div>

                    )}

            </div>

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default MotorRegras;
