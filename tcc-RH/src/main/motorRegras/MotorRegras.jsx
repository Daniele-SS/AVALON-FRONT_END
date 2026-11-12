
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import CadastroRegra from './cadastroRegra.jsx';
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

    // Controla a exibição da tela de cadastro.
    const [mostrarCadastro, setMostrarCadastro] = useState(false);

    const [erro, setErro] = useState('');

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: '',
        classificacao: 'Todos'
    });


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

            // Localiza a regra selecionada.
            const regra = regras.find(
                (item) => String(item.id) === String(id)
            );

            if (!regra) {
                throw new Error('Regra não encontrada.');
            }

            // Atualiza o status no banco de dados.
            await alterarStatusRegra(
                id,
                ativo,
                regra
            );

            // Atualiza somente o status no estado local.
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

            alert(erroApi.message);

        }

    }


    //----------------- EXCLUIR REGRA -------------------------//

    async function removerRegra(id) {

        // Solicita confirmação antes de excluir.
        const confirmar = window.confirm(
            'Tem certeza que deseja excluir esta regra?'
        );

        if (!confirmar) {

            return;

        }

        try {

            // Envia a exclusão para a API.
            await excluirRegra(id);

            // Atualiza a listagem após excluir.
            await carregarDados();

        } catch (erroApi) {

            console.error(
                'Erro ao excluir regra:',
                erroApi
            );

            alert(erroApi.message);

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


    //----------------- NOVA REGRA ---------------------------//

    function novaRegra() {

        // Abre a tela de cadastro.
        setMostrarCadastro(true);

    }


    //----------------- VOLTAR PARA LISTAGEM -----------------//

    function voltarCadastro() {

        // Fecha o cadastro e retorna ao Motor de Regras.
        setMostrarCadastro(false);

    }


    //----------------- EXIBIR CADASTRO ----------------------//

    if (mostrarCadastro) {

        return (

            <CadastroRegra

                voltar={voltarCadastro}

            />

        );

    }


    //----------------- TELA PRINCIPAL -----------------------//

    return (

        <>

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
