//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';

import '../../componentes/cardNomePag/nomePag.css';
import './css-ferias/ferias.css';

import Minicards from '../../componentes/minicard/minicard.jsx';

import buscarDadosFerias from './servicos/ferias.js';

import {calcularIndicadoresFerias} from './funcoes/ferias.js';

import CalendarioIcone from './img/calendario-icon.svg';
import CaixaIcone from './img/caixa-icon.svg';
import ConfereIcone from './img/confere-icon.svg';
import GuardaSolIcone from './img/guardaSol-icon.svg';


//----------------- COMPONENTE ------------------------------//

function Ferias() {

    //----------------- ESTADOS -----------------------------//

    const [ferias, setFerias] = useState([]);

    const [carregando, setCarregando] = useState(true);


    //----------------- BUSCAR DADOS -------------------------//

    async function buscarDados() {

        setCarregando(true);

        try {

            const dados = await buscarDadosFerias();

            setFerias(dados.ferias || []);

        } catch (erro) {

            console.error(
                'Erro ao buscar dados das férias:',
                erro
            );

        } finally {

            setCarregando(false);

        }

    }


    //----------------- INICIALIZAÇÃO ------------------------//

    useEffect(() => {

        buscarDados();

    }, []);


    //----------------- NOVA FÉRIAS --------------------------//

    function novaFerias() {

        console.log('Botão Nova Férias clicado!');

    }


    //----------------- INDICADORES --------------------------//

    const {
        programado,
        emFeriasHoje,
        proximos30Dias,
        finalizadasNoAno
    } = calcularIndicadoresFerias(ferias);


    //----------------- TELA PRINCIPAL -----------------------//

    return (

        <>

            <BotaoCadastro
                titulo="Férias"
                descricao="Consulte e gerencie os períodos de férias dos colaboradores."
                textoBotao="Nova Férias"
                onClick={novaFerias}
            />


            {/* MINICARDS DE FÉRIAS */}

            <div className="minicard-ferias">

                <Minicards
                    icone={CalendarioIcone}
                    numero={programado}
                    informacao="FÉRIAS PROGRAMADAS"
                    corFundo="#DBE1FF"
                    layout="vertical"
                />

                <Minicards
                    icone={GuardaSolIcone}
                    numero={emFeriasHoje}
                    informacao="EM FÉRIAS HOJE"
                    corFundo="#6FFBBE"
                    layout="vertical"
                />

                <div className="minicard-proximos-30">
                    <Minicards
                        icone={CaixaIcone}
                        numero={proximos30Dias}
                        informacao="FÉRIAS NOS PRÓXIMOS 30 DIAS"
                        corFundo="#E2E7FF"
                        layout="vertical"
                    />
                </div>

                <Minicards
                    icone={ConfereIcone}
                    numero={finalizadasNoAno}
                    informacao="FINALIZADAS NO ANO"
                    corFundo="#EAEDFF"
                    layout="vertical"
                />

            </div>


            {/* CARREGAMENTO */}

            {carregando && (
                <p>Carregando dados...</p>
            )}

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Ferias;