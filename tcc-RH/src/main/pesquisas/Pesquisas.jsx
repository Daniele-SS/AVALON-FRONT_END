import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'


function Pesquisas() {
    function novaPesquisa() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Pesquisas"
            descricao="Crie pesquisas, acompanhe a participação e analise a percepção dos colaboradores com garantia de sigilo estatístico."
            textoBotao="Nova Pesquisa"
            onClick={novaPesquisa}
        />
    );
}

export default Pesquisas