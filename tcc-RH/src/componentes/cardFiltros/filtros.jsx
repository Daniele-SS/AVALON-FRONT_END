//----------------- IMPORTAÇÕES -----------------------------//

import { useState } from 'react';

import './filtro.css';

import PesquisaIcone from '../img/pesquisa-icon.svg';
import LupaIcone from '../img/lupa-icon.svg';
import ResetIcone from '../img/reset-icon.svg';


//----------------- COMPONENTE ------------------------------//

function Filtro({
    titulo = 'Pesquisar',
    placeholder = 'Digite para pesquisar',
    nomeDropdown = 'Categoria',
    opcoesDropdown = [],
    onFiltrosChange,
    mostrarStatus = true
}) {

    //----------------- ESTADOS -----------------------------//

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    const [menuAberto, setMenuAberto] = useState(false);


    //----------------- ATUALIZAR FILTRO ---------------------//

    function atualizarFiltro(campo, valor) {

        const novosFiltros = {
            ...filtros,
            [campo]: valor
        };

        setFiltros(novosFiltros);

        if (onFiltrosChange) {
            onFiltrosChange(novosFiltros);
        }

    }


    //----------------- SELECIONAR OPÇÃO ---------------------//

    function selecionarOpcao(opcao) {

        atualizarFiltro('opcao', opcao);

        setMenuAberto(false);

    }


    //----------------- RESETAR FILTROS ----------------------//

    function resetarFiltros() {

        const filtrosLimpos = {
            pesquisa: '',
            status: 'Todos',
            opcao: ''
        };

        setFiltros(filtrosLimpos);

        setMenuAberto(false);

        if (onFiltrosChange) {
            onFiltrosChange(filtrosLimpos);
        }

    }


    //----------------- OBTER VALOR DA OPÇÃO -----------------//

    function obterValor(opcao) {

        if (typeof opcao === 'object' && opcao !== null) {

            return String(
                opcao.id ??
                opcao.value ??
                opcao.nome ??
                ''
            );

        }

        return String(opcao);

    }


    //----------------- OBTER NOME DA OPÇÃO ------------------//

    function obterNome(opcao) {

        if (typeof opcao === 'object' && opcao !== null) {

            return opcao.nome ??
                opcao.label ??
                String(opcao.id ?? '');

        }

        return String(opcao);

    }


    //----------------- OPÇÃO SELECIONADA --------------------//

    const opcaoSelecionada = opcoesDropdown.find(
        (opcao) => obterValor(opcao) === filtros.opcao
    );


    //----------------- TELA DO FILTRO -----------------------//

    return (

        <div className="card-filtro">

            {/* CABEÇALHO */}

            <div className="string-filtro">

                <div className="nome-filtro">

                    <img
                        src={PesquisaIcone}
                        alt=""
                    />

                    <h4>{titulo}</h4>

                </div>

                <p>Filtre e encontre os registros desejados</p>

            </div>


            {/* CONTROLES DOS FILTROS */}

            <div className="filtros">

                {/* PESQUISA */}

                <div className="filtro-de-pesquisa">

                    <img
                        src={LupaIcone}
                        alt=""
                    />

                    <input
                        type="text"
                        name="pesquisar"
                        placeholder={placeholder}
                        value={filtros.pesquisa}
                        onChange={(evento) =>
                            atualizarFiltro(
                                'pesquisa',
                                evento.target.value
                            )
                        }
                    />

                </div>


                {/* BOTÕES DE STATUS */}

                {mostrarStatus && (

                    <div className="filtro-selecao">

                        {['Todos', 'Ativos', 'Inativos'].map((status) => (

                            <button
                                key={status}
                                type="button"
                                className={
                                    filtros.status === status
                                        ? 'selecionado'
                                        : ''
                                }
                                onClick={() =>
                                    atualizarFiltro('status', status)
                                }
                            >
                                {status}
                            </button>

                        ))}

                    </div>

                )}


                {/* DROPDOWN */}

                <div className="dropbox">

                    <button
                        type="button"
                        className={`dropbox-menu ${
                            menuAberto ? 'seta-aberta' : ''
                        }`}
                        onClick={() => setMenuAberto(!menuAberto)}
                        aria-expanded={menuAberto}
                    >

                        <span className="texto-setor">

                            <span>{nomeDropdown}:</span>

                            <span className="setor-selecionado">

                                {opcaoSelecionada
                                    ? obterNome(opcaoSelecionada)
                                    : 'Todos'}

                            </span>

                        </span>

                        <span className="seta-dropdown">
                            ⌄
                        </span>

                    </button>


                    {/* OPÇÕES DO DROPDOWN */}

                    {menuAberto && (

                        <div className="dropdown-nome">

                            <button
                                type="button"
                                onClick={() => selecionarOpcao('')}
                            >
                                Todos
                            </button>

                            {opcoesDropdown.map((opcao) => (

                                <button
                                    key={obterValor(opcao)}
                                    type="button"
                                    className={
                                        filtros.opcao === obterValor(opcao)
                                            ? 'opcao-selecionada'
                                            : ''
                                    }
                                    onClick={() =>
                                        selecionarOpcao(obterValor(opcao))
                                    }
                                >
                                    {obterNome(opcao)}
                                </button>

                            ))}

                        </div>

                    )}

                </div>


                {/* LIMPAR FILTROS */}

                <button
                    type="button"
                    className="reset"
                    onClick={resetarFiltros}
                    title="Limpar todos os filtros"
                    aria-label="Limpar todos os filtros"
                >

                    <img
                        src={ResetIcone}
                        alt=""
                    />

                </button>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Filtro;