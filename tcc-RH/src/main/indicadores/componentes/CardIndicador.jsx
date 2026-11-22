
import './css-componentes/cardIndicador.css';

const PARAMETRO_MINIMO = 2.5;

function converterValor(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    // Aceita "4,2 / 5,0", "4,2" ou 4.2
    const texto = String(valor)
        .split('/')[0]
        .trim()
        .replace(',', '.');

    const numero = Number(texto);

    return Number.isFinite(numero) ? numero : null;
}

function obterClassificacao(valor) {
    const numero = converterValor(valor);

    if (numero === null) {
        return 'Sem dados';
    }

    if (numero < PARAMETRO_MINIMO) {
        return 'Abaixo da Meta';
    }

    if (numero < 3.5) {
        return 'Atenção';
    }

    return 'Normal';
}

function normalizarClasse(texto) {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replaceAll(' ', '-');
}

function CardIndicador({
    titulo,
    valor,
    descricao,
    icone,
    classificacao
}) {
    const status = classificacao || obterClassificacao(valor);
    const classeStatus = normalizarClasse(status);

    return (
        <article className="card-indicador">
            <div className="card-indicador-topo">
                <div className="card-indicador-cabecalho">
                    {icone && (
                        <span
                            className="card-indicador-icone"
                            aria-hidden="true"
                        >
                            {icone}
                        </span>
                    )}

                    <span className="card-indicador-titulo">
                        {titulo}
                    </span>
                </div>

                <span className={`card-indicador-status ${classeStatus}`}>
                    <span className="card-indicador-status-ponto" />
                    {status}
                </span>
            </div>

            <h3 className="card-indicador-descricao">
                {descricao}
            </h3>

            <strong className="card-indicador-valor">
                {valor}
            </strong>
        </article>
    );
}

export default CardIndicador;
