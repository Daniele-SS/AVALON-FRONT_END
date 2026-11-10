
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import CardRegra from './componentes/CardRegra.jsx';

import buscarDadosMotorRegras from './servicos/motorRegrasApi.js';

import filtrarRegras from './funcoes/regra/filtrarRegras.js';
import montarInformacoesRegras from './funcoes/regra/montarInformacoesRegras.js';

import './css-motorRegras/motorRegras.css';


//----------------- ÍCONES ---------------------------------//

import AvaliacoesIcone from '../avaliacaoPsicossocial/img/avaliacoes-icon.svg';
import ParticipantesIcone from '../avaliacaoPsicossocial/img/participantes-icon.svg';
import AtencaoIcone from '../avaliacaoPsicossocial/img/atencao-icon.svg';


//----------------- COMPONENTE ------------------------------//

function MotorRegras() {

    //----------------- ESTADOS -----------------------------//

    const [regras, setRegras] = useState([]);

    const [carregando, setCarregando] = useState(true);

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

        console.log('Abrir cadastro de nova regra.');

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

                    icone={AvaliacoesIcone}

                    numero={
                        carregando ? '—' : informacoes.totalRegras
                    }

                    informacao="Regras cadastradas"

                    corFundo="#E8EDFF"

                    layout="horizontal"

                />

                <Minicards

                    icone={ParticipantesIcone}

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

                    icone={AtencaoIcone}

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
