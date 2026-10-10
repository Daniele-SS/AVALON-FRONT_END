import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'


function Beneficios() {
    function novoBeneficio() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Benefícios"
            descricao="Gerencie os benefícios disponibilizados pela organização e acompanhe os colaboradores vinculados."
            textoBotao="Novo Benefício"
            onClick={novoBeneficio}
        />
    );
}

export default Beneficios