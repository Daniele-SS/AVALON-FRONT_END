
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import {
    buscarBeneficios,
    buscarBeneficiosCargo,
    buscarBeneficiosSetor
} from '../servicos/beneficioColaboradorApi.js';

import './beneficiosColaborador.css';


//----------------- COMPONENTE ------------------------------//

function BeneficiosColaborador({
    dados,
    beneficiosSelecionados = [],
    setBeneficiosSelecionados
}) {

    //----------------- ESTADOS -----------------------------//

    const [beneficios, setBeneficios] = useState([]);
    const [beneficiosCargo, setBeneficiosCargo] = useState([]);
    const [beneficiosSetor, setBeneficiosSetor] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');


    //----------------- CARREGAR BENEFÍCIOS -----------------//

    useEffect(() => {

        async function carregarBeneficios() {

            setCarregando(true);
            setErro('');

            try {

                const [
                    listaBeneficios,
                    listaCargo,
                    listaSetor
                ] = await Promise.all([
                    buscarBeneficios(),
                    buscarBeneficiosCargo(),
                    buscarBeneficiosSetor()
                ]);

                setBeneficios(listaBeneficios);
                setBeneficiosCargo(listaCargo);
                setBeneficiosSetor(listaSetor);

            } catch (erro) {

                console.error(
                    'Erro ao carregar benefícios:',
                    erro
                );

                setErro(
                    'Não foi possível carregar os benefícios.'
                );

            } finally {

                setCarregando(false);

            }

        }

        carregarBeneficios();

    }, []);


    //----------------- IDENTIFICAR BENEFÍCIOS COMPATÍVEIS ---//

    function buscarBeneficiosDisponiveis() {

        const idCargo = String(dados.idCargo || '');
        const idSetor = String(dados.idSetor || '');

        return beneficios.filter((beneficio) => {

            // Somente benefícios ativos podem ser selecionados.
            if (Number(beneficio.status) !== 1) {
                return false;
            }

            // Benefícios disponíveis para todos.
            if (beneficio.disponibilidade === 'TODOS') {
                return true;
            }

            // Verificar compatibilidade com o cargo.
            if (beneficio.disponibilidade === 'CARGO') {

                return beneficiosCargo.some((vinculo) => {

                    const beneficioVinculado =
                        vinculo.beneficio?.beneficios?.some(
                            (item) =>
                                String(item.id) === String(beneficio.id)
                        );

                    const cargoCompativel =
                        String(vinculo.cargo?.id) === idCargo;

                    return beneficioVinculado && cargoCompativel;

                });

            }

            // Verificar compatibilidade com o setor.
            if (beneficio.disponibilidade === 'SETOR') {

                return beneficiosSetor.some((vinculo) => {

                    const beneficioVinculado =
                        vinculo.beneficio?.beneficios?.some(
                            (item) =>
                                String(item.id) === String(beneficio.id)
                        );

                    const setoresVinculados = Array.isArray(vinculo.setor)
                        ? vinculo.setor
                        : [vinculo.setor];

                    const setorCompativel = setoresVinculados.some(
                        (setor) =>
                            String(setor?.id) === idSetor
                    );

                    return beneficioVinculado && setorCompativel;

                });

            }

            return false;

        });

    }


    //----------------- BENEFÍCIOS DISPONÍVEIS ----------------//

    const beneficiosDisponiveis = buscarBeneficiosDisponiveis();


    //----------------- SELECIONAR BENEFÍCIO -----------------//

    function alterarBeneficio(idBeneficio) {

        const id = String(idBeneficio);

        const jaSelecionado = beneficiosSelecionados.some(
            (item) => String(item) === id
        );

        if (jaSelecionado) {

            setBeneficiosSelecionados(
                beneficiosSelecionados.filter(
                    (item) => String(item) !== id
                )
            );

            return;

        }

        setBeneficiosSelecionados([
            ...beneficiosSelecionados,
            id
        ]);

    }


    //----------------- REMOVER BENEFÍCIO --------------------//

    function removerBeneficio(idBeneficio) {

        setBeneficiosSelecionados(
            beneficiosSelecionados.filter(
                (item) => String(item) !== String(idBeneficio)
            )
        );

    }


    //----------------- TELA ---------------------------------//

    return (

        <section className="card-beneficios-colaborador">

            <div className="cabecalho-beneficios-colaborador">

                <div>
                    <h2>Benefícios</h2>

                    <p>
                        Selecione os benefícios disponibilizados
                        para este colaborador.
                    </p>
                </div>

                <span className="etiqueta-beneficios">
                    Opcional
                </span>

            </div>


            {/* CARREGAMENTO */}

            {carregando && (
                <p className="mensagem-beneficios">
                    Carregando benefícios...
                </p>
            )}


            {/* ERRO */}

            {!carregando && erro && (
                <p className="mensagem-erro-beneficios">
                    {erro}
                </p>
            )}


            {/* LISTA DE BENEFÍCIOS */}

            {!carregando && !erro && (

                <>

                    {!dados.idCargo || !dados.idSetor ? (

                        <p className="mensagem-beneficios">
                            Selecione primeiro o cargo e o setor
                            para visualizar os benefícios disponíveis.
                        </p>

                    ) : beneficiosDisponiveis.length === 0 ? (

                        <p className="mensagem-beneficios">
                            Não existem benefícios disponíveis
                            para o cargo e setor selecionados.
                        </p>

                    ) : (

                        <div className="lista-beneficios-colaborador">

                            {beneficiosDisponiveis.map((beneficio) => {

                                const selecionado =
                                    beneficiosSelecionados.some(
                                        (item) =>
                                            String(item) ===
                                            String(beneficio.id)
                                    );

                                return (

                                    <label
                                        key={beneficio.id}
                                        className={`item-beneficio-colaborador ${
                                            selecionado ? 'selecionado' : ''
                                        }`}
                                    >

                                        <input
                                            type="checkbox"
                                            checked={selecionado}
                                            onChange={() =>
                                                alterarBeneficio(beneficio.id)
                                            }
                                        />

                                        <div className="informacoes-beneficio">

                                            <strong>
                                                {beneficio.nome}
                                            </strong>

                                            <span>
                                                {beneficio.descricao}
                                            </span>

                                        </div>

                                    </label>

                                );

                            })}

                        </div>

                    )}


                    {/* BENEFÍCIOS SELECIONADOS */}

                    <div className="beneficios-selecionados">

                        <h3>
                            Benefícios selecionados
                            ({beneficiosSelecionados.length})
                        </h3>

                        {beneficiosSelecionados.length === 0 ? (

                            <p>
                                Nenhum benefício selecionado.
                            </p>

                        ) : (

                            <div className="chips-beneficios">

                                {beneficiosSelecionados.map((id) => {

                                    const beneficio = beneficios.find(
                                        (item) =>
                                            String(item.id) === String(id)
                                    );

                                    return (

                                        <span
                                            key={id}
                                            className="chip-beneficio"
                                        >

                                            {beneficio?.nome ||
                                                `Benefício ${id}`}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removerBeneficio(id)
                                                }
                                                aria-label={`Remover ${
                                                    beneficio?.nome || 'benefício'
                                                }`}
                                            >
                                                ×
                                            </button>

                                        </span>

                                    );

                                })}

                            </div>

                        )}

                    </div>

                </>

            )}

        </section>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default BeneficiosColaborador;
