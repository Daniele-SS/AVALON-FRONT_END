//----------------- CALCULAR INDICADORES -----------------------------//

function calcularIndicadoresDocumentos(documentos = []) {

    //----------------- AGRUPAR TIPOS -------------------------------//

    const contratos = documentos.filter(documento =>
        ['Contrato', 'Aditivo Contratual'].includes(documento.tipo_documento)
    ).length;

    const termos = documentos.filter(documento =>
        documento.tipo_documento === 'Termo'
    ).length;

    const recibos = documentos.filter(documento =>
        documento.tipo_documento === 'Recibo'
    ).length;

    const avaliacoes = documentos.filter(documento =>
        documento.tipo_documento === 'Avaliação'
    ).length;

    const outros = documentos.filter(documento =>
        [
            'Documento',
            'Política',
            'Advertência',
            'Rescisão',
            'Comunicação',
            'Outros'
        ].includes(documento.tipo_documento)
    ).length;


    //----------------- RETORNAR INDICADORES ------------------------//

    return {
        contratos,
        termos,
        recibos,
        avaliacoes,
        outros
    };

}


//----------------- EXPORTAÇÃO ---------------------------------------//

export default calcularIndicadoresDocumentos;