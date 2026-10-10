import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'

function Feedbacks() {
    function novoFeedback() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Feedbacks"
            descricao="Registre, acompanhe e consulte feedbacks entre gestores e colaboradores com foco em
desenvolvimento contínuo e alinhamento de expectativas."
            textoBotao="Novo Feedback"
            onClick={novoFeedback}
        />
    );
}

export default Feedbacks