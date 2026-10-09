import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'
function Setores() {

    function novoSetor() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Setores"
            descricao="Gerencie os setores da empresa."
            textoBotao="Novo setor"
            onClick={novoSetor}
        />
    );
}

export default Setores;