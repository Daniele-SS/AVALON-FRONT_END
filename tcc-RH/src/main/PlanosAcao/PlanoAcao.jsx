import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'

function PlanoAcao() {
    function novoPlano() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Plano de Ação"
            descricao="Transforme situações identificadas em ações acompanháveis e mensuráveis."
            textoBotao="Novo Plano"
            onClick={novoPlano}
        />
    );
}

export default PlanoAcao