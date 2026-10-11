// Importa o hook useState do React para criar e controlar estados.
import { useState } from 'react';

// Importa o arquivo CSS responsável pela aparência do filtro.
import './filtro.css';

// Importa os ícones utilizados no componente.
import PesquisaIcone from '../img/pesquisa-icon.svg';
import LupaIcone from '../img/lupa-icon.svg';
import ResetIcone from '../img/reset-icon.svg';

// Cria o componente reutilizável Filtro.
// As propriedades recebidas permitem personalizá-lo em diferentes telas.
function Filtro({
    titulo = 'Pesquisar', // Título exibido no cabeçalho do filtro.
    placeholder = 'Digite para pesquisar', // Texto exibido no campo de pesquisa.
    nomeDropdown = 'Categoria', // Nome da categoria exibida no dropdown.
    opcoesDropdown = [], // Lista de opções que aparecerão no dropdown.
    onFiltrosChange // Função opcional que avisa a tela quando os filtros mudam.
}) {

    // Armazena os valores atuais dos filtros.
    // pesquisa: texto digitado pelo usuário.
    // status: status selecionado, inicialmente Todos.
    // opcao: opção selecionada no dropdown.
    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    // Controla se o dropdown está aberto ou fechado.
    // Inicialmente, o menu começa fechado.
    const [menuAberto, setMenuAberto] = useState(false);

    // Atualiza um dos filtros sem apagar os valores dos outros.
    // campo indica qual propriedade será alterada.
    // valor representa o novo valor dessa propriedade.
    function atualizarFiltro(campo, valor) {

        // Copia os filtros atuais e altera somente a propriedade indicada.
        // O spread (...) preserva os outros valores do objeto.
        // [campo] permite escolher dinamicamente a propriedade a modificar.
        const novosFiltros = {
            ...filtros,
            [campo]: valor
        };

        // Atualiza o estado dos filtros no React.
        setFiltros(novosFiltros);

        // Verifica se a tela que utiliza o componente enviou uma função.
        if (onFiltrosChange) {

            // Envia os novos filtros para a tela que utiliza o componente.
            onFiltrosChange(novosFiltros);
        }
    }

    // Executa quando o usuário escolhe uma opção no dropdown.
    function selecionarOpcao(opcao) {

        // Atualiza a opção selecionada no filtro.
        atualizarFiltro('opcao', opcao);

        // Fecha o dropdown após a seleção.
        setMenuAberto(false);
    }

    // Limpa todos os filtros e restaura seus valores iniciais.
    function resetarFiltros() {

        // Cria um objeto com os valores padrão dos filtros.
        const filtrosLimpos = {
            pesquisa: '',
            status: 'Todos',
            opcao: ''
        };

        // Restaura os valores iniciais no estado.
        setFiltros(filtrosLimpos);

        // Fecha o dropdown caso esteja aberto.
        setMenuAberto(false);

        // Verifica se existe uma função para comunicar a alteração.
        if (onFiltrosChange) {

            // Informa à tela que todos os filtros foram limpos.
            onFiltrosChange(filtrosLimpos);
        }
    }

    // Retorna o identificador de uma opção do dropdown.
    // Aceita tanto textos simples quanto objetos recebidos de uma API.
    function obterValor(opcao) {

        // Verifica se a opção é um objeto válido.
        if (typeof opcao === 'object' && opcao !== null) {

            // Tenta obter o ID, o value ou o nome, nessa ordem.
            // O operador ?? utiliza o próximo valor quando o anterior
            // é null ou undefined.
            // String() converte o resultado para texto.
            return String(opcao.id ?? opcao.value ?? opcao.nome ?? '');
        }

        // Se a opção não for um objeto, converte o próprio valor para texto.
        return String(opcao);
    }

    // Retorna o nome que será exibido ao usuário no dropdown.
    function obterNome(opcao) {

        // Verifica se a opção é um objeto válido.
        if (typeof opcao === 'object' && opcao !== null) {

            // Tenta obter o nome, o label ou o ID, nessa ordem.
            return opcao.nome ?? opcao.label ?? String(opcao.id ?? '');
        }

        // Se a opção for um texto simples, retorna esse texto.
        return String(opcao);
    }

    // Procura no array a opção que corresponde ao valor selecionado.
    // Se não encontrar nenhuma correspondência, retorna undefined.
    const opcaoSelecionada = opcoesDropdown.find(
        (opcao) => obterValor(opcao) === filtros.opcao
    );

    // Define a interface visual que será exibida pelo componente.
    return (

        // Container principal do card de filtros.
        <div className="card-filtro">

            {/* Cabeçalho do card: ícone, título e texto auxiliar. */}
            <div className="string-filtro">

                {/* Agrupa o ícone e o título do filtro. */}
                <div className="nome-filtro">

                    {/* Exibe o ícone de pesquisa. */}
                    <img src={PesquisaIcone} alt="" />

                    {/* Exibe o título recebido pelas propriedades do componente. */}
                    <h4>{titulo}</h4>

                </div>

                {/* Texto auxiliar exibido no cabeçalho. */}
                <p>Filtre e encontre os registros desejados</p>

            </div>

            {/* Container que organiza os controles dos filtros. */}
            <div className="filtros">

                {/* Campo utilizado para pesquisar por texto. */}
                <div className="filtro-de-pesquisa">

                    {/* Exibe o ícone de lupa ao lado do campo. */}
                    <img src={LupaIcone} alt="" />

                    <input
                        type="text" // Define um campo de texto.
                        name="pesquisar" // Identifica o campo.
                        placeholder={placeholder} // Exibe o texto de orientação.
                        value={filtros.pesquisa} // Valor controlado pelo estado.

                        // Executa quando o texto digitado é alterado.
                        onChange={(evento) =>

                            // Atualiza o campo pesquisa com o texto digitado.
                            atualizarFiltro('pesquisa', evento.target.value)
                        }
                    />

                </div>

                {/* Container dos botões de status. */}
                <div className="filtro-selecao">

                    {/* Cria um botão para cada status do array. */}
                    {['Todos', 'Ativos', 'Inativos'].map((status) => (

                        <button
                            key={status} // Identifica cada botão para o React.
                            type="button" // Evita comportamento de envio de formulário.

                            // Aplica a classe selecionado apenas ao status atual.
                            className={
                                filtros.status === status ? 'selecionado' : ''
                            }

                            // Atualiza o status quando o botão é clicado.
                            onClick={() => atualizarFiltro('status', status)}
                        >
                            {/* Exibe o nome do status no botão. */}
                            {status}
                        </button>

                    ))}

                </div>

                {/* Container do dropdown e de sua lista de opções. */}
                <div className="dropbox">

                    {/* Botão responsável por abrir e fechar o dropdown. */}
                    <button
                        type="button"

                        // Adiciona seta-aberta quando o menu está aberto.
                        className={`dropbox-menu ${menuAberto ? 'seta-aberta' : ''}`}

                        // Inverte o estado atual do menu.
                        onClick={() => setMenuAberto(!menuAberto)}

                        // Informa às tecnologias assistivas se o menu está aberto.
                        aria-expanded={menuAberto}
                    >

                        {/* Agrupa o nome da categoria e a opção selecionada. */}
                        <span className="texto-setor">

                            {/* Exibe o nome recebido pela prop, como Cargo ou Setor. */}
                            <span>{nomeDropdown}:</span>

                            {/* Exibe a opção escolhida ou Todos, caso não haja seleção. */}
                            <span className="setor-selecionado">
                                {opcaoSelecionada
                                    ? obterNome(opcaoSelecionada)
                                    : `Todos`}
                            </span>

                        </span>

                        {/* Exibe a seta do dropdown. */}
                        <span className="seta-dropdown">⌄</span>

                    </button>

                    {/* Só exibe a lista quando menuAberto for verdadeiro. */}
                    {menuAberto && (

                        <div className="dropdown-nome">

                            {/* Opção que remove a seleção específica do dropdown. */}
                            <button
                                type="button"
                                onClick={() => selecionarOpcao('')}
                            >
                                Todos
                            </button>

                            {/* Percorre as opções recebidas pelas propriedades. */}
                            {opcoesDropdown.map((opcao) => (

                                <button
                                    // Usa o valor da opção como identificador do botão.
                                    key={obterValor(opcao)}
                                    type="button"

                                    // Destaca a opção que está selecionada.
                                    className={
                                        filtros.opcao === obterValor(opcao)
                                            ? 'opcao-selecionada'
                                            : ''
                                    }

                                    // Salva a opção selecionada e fecha o menu.
                                    onClick={() =>
                                        selecionarOpcao(obterValor(opcao))
                                    }
                                >
                                    {/* Exibe o nome legível da opção. */}
                                    {obterNome(opcao)}
                                </button>

                            ))}

                        </div>

                    )}

                </div>

                {/* Botão responsável por limpar todos os filtros. */}
                <button
                    type="button"
                    className="reset"

                    // Executa a função que restaura os filtros iniciais.
                    onClick={resetarFiltros}

                    // Texto que pode aparecer ao passar o mouse.
                    title="Limpar todos os filtros"

                    // Nome acessível para tecnologias assistivas.
                    aria-label="Limpar todos os filtros"
                >

                    {/* Ícone visual do botão de reset. */}
                    <img src={ResetIcone} alt="" />

                </button>

            </div>

        </div>
    );
}

// Permite importar o componente Filtro em outras telas do sistema.
export default Filtro;