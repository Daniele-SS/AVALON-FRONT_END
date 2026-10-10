import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'


function Documentos() {
    function novoDocumento() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Documentos"
            descricao="Centralize, organize e audite os arquivos e comprovantes dos colaboradores em um repositório corporativo unificado."
            textoBotao="Novo Documento"
            onClick={novoDocumento}
        />
    );
}

export default Documentos