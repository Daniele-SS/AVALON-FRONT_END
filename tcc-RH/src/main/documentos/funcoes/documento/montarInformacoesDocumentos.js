//----------------- MONTAR INFORMAÇÕES -------------------------------//

import ContratoIcone from '../../img/contrato-icon.svg'
import OutrosIcone from '../../img/outros.svg'
import ReciboIcone from '../../img/recibo-icon.svg'
import TermosIcone from '../../img/termos-icon.svg'
import AvaliacaoIcone from '../../img/avaliacao-icon.svg'

function montarInformacoesDocumentos(indicadores) {

    return [

        {
            id: 1,
            informacao: 'Contratos',
            numero: indicadores.contratos,
            icone: ContratoIcone,
            corFundo: '#EADDFF'

        },

        {
            id: 2,
            informacao: 'Termos',
            numero: indicadores.termos,
            icone: TermosIcone,
            corFundo: '#DDF5E8'
        },

        {
            id: 3,
            informacao: 'Recibos',
            numero: indicadores.recibos,
            icone: ReciboIcone,
            corFundo: '#BDD6FF'
        },

        {
            id: 4,
            informacao: 'Avaliações',
            numero: indicadores.avaliacoes,
            icone: AvaliacaoIcone,
            corFundo: '#FFF0D6'
        },

        {
            id: 5,
            informacao: 'Outros documentos',
            numero: indicadores.outros,
            icone: OutrosIcone,
            corFundo: '#F0F1F4'
        }

    ];

}


//----------------- EXPORTAÇÃO ---------------------------------------//

export default montarInformacoesDocumentos;