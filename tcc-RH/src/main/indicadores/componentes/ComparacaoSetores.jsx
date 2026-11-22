
import './css-componentes/comparacaoSetores.css';

const ESCALA_MAXIMA = 5;

function formatarMedia(media) {
    if (media === null || media === undefined || media === '') {
        return '—';
    }

    const numero = Number(media);

    if (!Number.isFinite(numero)) {
        return '—';
    }

    return numero.toFixed(1).replace('.', ',');
}

function obterClassificacao(media, parametroMinimo) {
    if (media === null || !Number.isFinite(media)) {
        return 'Sem dados';
    }

    if (media < parametroMinimo) {
        return 'Abaixo da Meta';
    }

    if (media < 3.5) {
        return 'Atenção';
    }

    return 'Normal';
}

function obterClasseClassificacao(classificacao) {
    return classificacao
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replaceAll(' ', '-');
}

function ComparacaoSetores({
    dados = [],
    fatores = [],
    fatorSelecionado,
    onFatorChange,
    parametroMinimo = 2.5
}) {
    return (
        <section className="comparacao-setores">
            <div className="comparacao-setores-topo">
                <div className="comparacao-setores-titulo">
                    <p>Desagregação Operacional</p>
                    <h2>Comparação por Setor</h2>
                </div>

                <label className="comparacao-setores-seletor">
                    <span>Indicador analisado:</span>

                    <select
                        value={fatorSelecionado}
                        onChange={(evento) => {
                            onFatorChange(evento.target.value);
                        }}
                    >
                        {fatores.map((fator) => (
                            <option key={fator} value={fator}>
                                {fator}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {dados.length === 0 ? (
                <div className="comparacao-setores-vazio">
                    <span className="comparacao-setores-vazio-icone">
                        —
                    </span>

                    <strong>Dados insuficientes para comparação</strong>

                    <p>
                        São necessários pelo menos 5 participantes distintos
                        por setor para exibir os resultados.
                    </p>
                </div>
            ) : (
                <div className="comparacao-setores-lista">
                    {dados.map((setor) => {
                        const media = Number(setor.media);
                        const mediaValida = Number.isFinite(media);

                        const abaixoDaMeta =
                            mediaValida && media < parametroMinimo;

                        const classificacao = obterClassificacao(
                            mediaValida ? media : null,
                            parametroMinimo
                        );

                        const classeClassificacao =
                            obterClasseClassificacao(classificacao);

                        const largura = mediaValida
                            ? Math.min(
                                100,
                                Math.max(0, (media / ESCALA_MAXIMA) * 100)
                            )
                            : 0;

                        const posicaoMeta =
                            (parametroMinimo / ESCALA_MAXIMA) * 100;

                        return (
                            <div
                                className={`comparacao-setor-item ${
                                    abaixoDaMeta ? 'abaixo-da-meta' : ''
                                }`}
                                key={setor.id}
                            >
                                <div className="comparacao-setor-informacoes">
                                    <div className="comparacao-setor-nome">
                                        {setor.codigo && (
                                            <span className="comparacao-setor-codigo">
                                                {setor.codigo}
                                            </span>
                                        )}

                                        <strong>{setor.nome}</strong>
                                    </div>

                                    <div className="comparacao-setor-resultado">
                                        <strong className="comparacao-setor-media">
                                            {formatarMedia(setor.media)}
                                            <span> / 5,0</span>
                                        </strong>

                                        <span
                                            className={`comparacao-setor-status ${classeClassificacao}`}
                                        >
                                            {classificacao}
                                        </span>
                                    </div>
                                </div>

                                <div className="comparacao-setor-trilho">
                                    <div
                                        className="comparacao-setor-barra"
                                        style={{ width: `${largura}%` }}
                                    />

                                    <span
                                        className="comparacao-setor-meta"
                                        style={{ left: `${posicaoMeta}%` }}
                                    />
                                </div>

                                {abaixoDaMeta ? (
                                    <div className="comparacao-setor-alerta-mensagem">
                                        <span aria-hidden="true">⚠</span>

                                        <span>
                                            Este setor está abaixo do parâmetro
                                            de segurança operacional (
                                            {formatarMedia(parametroMinimo)}).
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="comparacao-setores-legenda">
                <span>
                    <i className="comparacao-legenda-meta" />
                    Parâmetro mínimo: {formatarMedia(parametroMinimo)}
                </span>

                <span>Escala de 1 a 5</span>
            </div>
        </section>
    );
}

export default ComparacaoSetores;
