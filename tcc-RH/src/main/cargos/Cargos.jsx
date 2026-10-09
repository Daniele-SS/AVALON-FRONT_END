import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'

function Cargos() {
    function novoColaborador() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Cargos"
            descricao="Gerencie e consulte os cargos da organização."
            textoBotao="Novo Cargo"
            onClick={novoColaborador}
        />
    );
}

export default Cargos