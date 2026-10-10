import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'


function MotorRegras() {
    function novaRegra() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Motor de Regras"
            descricao="Automatize a identificação de situações que precisam de atenção."
            textoBotao="Nova Regra"
            onClick={novaRegra}
        />
    );
}

export default MotorRegras