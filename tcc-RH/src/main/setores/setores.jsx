import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';

import '../../componentes/cardNomePag/nomePag.css'
import '../../componentes/minicard/minicard.css'
import './css-setores/setores.css'

import SetoresAtivos from "./img/setoresAtivos-icon.svg"
import iconeColaboradores from './img/colaboradores-icon.svg'
import SetoresInativos from "./img/setoresInativos-icon.svg"


function Setores() {

    function novoSetor() {
        console.log('Botão Novo Setor clicado!');
    }

    return (
        <>
            <BotaoCadastro
                titulo="Setores"
                descricao="Gerencie os setores da empresa."
                textoBotao="Novo setor"
                onClick={novoSetor}
            />

            <div className='container-minicards'>
                <Minicards
                    icone={SetoresAtivos}
                    numero="248"
                    informacao="Total de setores cadastrados"
                    corFundo = "#EFF4FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={iconeColaboradores}
                    numero="248"
                    informacao="Total de setores em utilização"
                    corFundo = "#E1FFEC"
                    layout="horizontal"
                />

                <Minicards
                    icone={SetoresInativos}
                    numero="248"
                    informacao="Total de setores Inativos"
                    corFundo = "#E5EEFF"
                    layout="horizontal"
                />

            </div>


        </>
    );
}

export default Setores;