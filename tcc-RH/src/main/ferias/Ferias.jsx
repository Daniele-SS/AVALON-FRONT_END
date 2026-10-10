import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'


function Ferias() {
    function novaFerias() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Férias"
            descricao="Consulte e gerencie os períodos de férias dos colaboradores."
            textoBotao="Nova Férias"
            onClick={novaFerias}
        />
    );
}

export default Ferias