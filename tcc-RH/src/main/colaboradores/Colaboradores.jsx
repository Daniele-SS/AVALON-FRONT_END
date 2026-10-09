import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'

function Colaboradores() {

    function novoSetor() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Colaboradores"
            descricao="Gerencie dados cadastrais, vínculos funcionais e status operacionais dos colaboradores."
            textoBotao="Novo Colaborador"
            onClick={novoSetor}
        />
    );
}

export default Colaboradores