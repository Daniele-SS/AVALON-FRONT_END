import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import '../../componentes/cardNomePag/nomePag.css'

function JornadaEscala() {

    function novaJornada() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <BotaoCadastro
            titulo="Jornada e Escala"
            descricao="Gerencie e consulte os horários e a jornada dos colaboradores. da organização."
            textoBotao="Nova Jornada"
            onClick={novaJornada}
        />
    );
}

export default JornadaEscala