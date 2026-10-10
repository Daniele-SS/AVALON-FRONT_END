import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'


function AvaliacaoPsicossocial() {

    function novaAvaliação() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Avaliação Psicossocial"
            descricao="Acompanhe avaliações e identifique fatores psicossociais que merecem atenção no ambiente de trabalho."
            textoBotao="Nova Avaliação"
            onClick={novaAvaliação}
        />
    );
}

export default AvaliacaoPsicossocial