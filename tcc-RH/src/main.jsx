import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './login/Login'

import Layout from './menu/Layout'

import Dashboard from './main/dashboard/Dashboard'
import Colaboradores from './main/colaboradores/Colaboradores'
import Setores from './main/setores/setores'
import Cargos from './main/cargos/Cargos'
import JornadaEscala from './main/jornadaEscala/jornadaEscala'
import Ferias from './main/ferias/Ferias'
import Beneficios from './main/beneficios/Beneficios'
import Documentos from './main/documentos/Documentos'
import Feedbacks from './main/feedbacks/Feedbacks'
import Pesquisas from './main/pesquisas/Pesquisas'
import Indicadores from './main/indicadores/Indicadores'
import AvaliacaoPsicossocial from './main/avaliacaoPsicossocial/AvaliacaoPsicossocial'
import MotorRegras from './main/motorRegras/MotorRegras'
import PlanoAcao from './main/PlanosAcao/PlanoAcao'
import Notificacao from './main/notificacao/Notificacao'
import MinhaEquipe from './main/minhaEquipe/MinhaEquipe'
import Solicitacao from './main/solicitacao/Solicitacao'

import './menu/CSS-Menu/sidebar.css'

import './login/css-login/login.css'

import   './main/dashboard/css-dashboard/dashboard.css'
import   './main/colaboradores/css-colaboradores/colaboradores.css'
import   './main/setores/css-setores/setores.css'
import   './main/cargos/css-cargos/cargos.css'
import   './main/jornadaEscala/css-jornadaEscala/jornadaEscala.css'
import   './main/ferias/css-ferias/ferias.css'
import   './main/beneficios/css-beneficios/beneficios.css'
import   './main/documentos/css-documentos/documentos.css'
import   './main/feedbacks/css-feedbacks/feedbacks.css'
import   './main/pesquisas/css-pesquisas/pesquisas.css'
import   './main/indicadores/css-indicadores/indicadores.css'
import   './main/avaliacaoPsicossocial/css-avaliacaoPsicossocial/avaliacaoPsicossocial.css'
import   './main/motorRegras/css-motorRegras/motorRegras.css'
import   './main/PlanosAcao/css-planoAcao/planoAcao.css'
import   './main/notificacao/css-notificacao/notificacao.css'
import   './main/minhaEquipe/css-minhaEquipe/minhaEquipe.css'
import   './main/solicitacao/css-solicitacao/solicitacao.css'

function Sistema() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/colaboradores" element={<Colaboradores />} />
          <Route path="/setores" element={<Setores />} />
          <Route path="/cargos" element={<Cargos />} />
          <Route path="/jornada-escala" element={<JornadaEscala />} />
          <Route path="/ferias" element={<Ferias />} />
          <Route path="/beneficios" element={<Beneficios />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/pesquisas" element={<Pesquisas />} />
          <Route path="/indicadores" element={<Indicadores />} />
          <Route path="/avaliacao-psicossocial" element={<AvaliacaoPsicossocial />} />
          <Route path="/motor-regras" element={<MotorRegras />} />
          <Route path="/planos-acao" element={<PlanoAcao />} />
          <Route path="/notificacoes" element={<Notificacao />} />
          <Route path="/minha-equipe" element={<MinhaEquipe />} />
          <Route path="/solicitacao" element={<Solicitacao />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sistema />
  </StrictMode>,
)