
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import dashboardIcon from './img/img-dashboard.svg';
import colaboradorIcon from './img/img-colaborador.svg';
import setorIcon from './img/img-setores.svg';
import cargoIcon from './img/img-cargo.svg';
import jornadaEscalaIcon from './img/img-jornadaEscala.svg';
import feriasIcon from './img/img-ferias.svg';
import beneficiosIcon from './img/img-beneficio.svg';
import documentosIcon from './img/img-documentos.svg';
import feedbacksIcon from './img/img-feedback.svg';
import pesquisaIcon from './img/img-pesquisa.svg';
import indicadoresIcon from './img/img-indicadores.svg';
import avaliacaoIcon from './img/img-avaliacao.svg';
import motorIcon from './img/img-motor.svg';
import planoIcon from './img/img-plano.svg';
import notificacaoIcon from './img/img-notificacao.svg';
import minhaEquipeIcon from './img/img-minhaEquipe.svg';
import solicitacaoIcon from './img/img-solicitacao.svg';

const icones = {
    'icon-dashboard': dashboardIcon,
    'icon-colaborador': colaboradorIcon,
    'icon-setor': setorIcon,
    'icon-cargo': cargoIcon,
    'icon-jornada': jornadaEscalaIcon,
    'icon-ferias': feriasIcon,
    'icon-beneficios': beneficiosIcon,
    'icon-documentos': documentosIcon,
    'icon-feedbacks': feedbacksIcon,
    'icon-pesquisa': pesquisaIcon,
    'icon-indicadores': indicadoresIcon,
    'icon-avaliacao': avaliacaoIcon,
    'icon-motor': motorIcon,
    'icon-plano': planoIcon,
    'icon-notificacao': notificacaoIcon,
    'icon-minhaEquipe': minhaEquipeIcon,
    'icon-solicitacao': solicitacaoIcon
};

function Sidebar() {
    const [menus, setMenus] = useState([]);
    const navegar = useNavigate();

    useEffect(() => {
        async function carregarMenus() {
            try {
                const token = localStorage.getItem('access_token');

                if (!token) {
                    navegar('/');
                    return;
                }

                const resposta = await fetch(
                    'http://localhost:8080/v1/senai/avalon/menu',
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (resposta.status === 401) {
                    localStorage.removeItem('access_token');
                    navegar('/');
                    return;
                }

                if (!resposta.ok) {
                    throw new Error(
                        `Erro ao buscar menus. Código: ${resposta.status}`
                    );
                }

                const dados = await resposta.json();

                console.log('Resposta da API de menus:', dados);

                // Confere se a API retornou a lista de menus.
                const listaMenus = dados.response?.menu;

                if (!Array.isArray(listaMenus)) {
                    throw new Error(
                        'A resposta da API não contém uma lista válida de menus.'
                    );
                }

                const menusOrdenados = [...listaMenus].sort(
                    (a, b) => a.ordem - b.ordem
                );

                setMenus(menusOrdenados);
            } catch (erro) {
                console.error('Erro ao carregar menus:', erro);
            }
        }

        carregarMenus();
    }, [navegar]);

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>Avalon</h2>
            </div>

            <nav className="sidebar-menu">
                {menus.map((menu) => (
                    <NavLink
                        key={menu.id}
                        to={menu.rota}
                        className={({ isActive }) =>
                            isActive ? 'menu-ativo' : ''
                        }
                    >
                        <img
                            src={icones[menu.icone]}
                            alt=""
                            className="sidebar-menu-icon"
                        />

                        <span className="sidebar-menu-text">
                            {menu.nome}
                        </span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
