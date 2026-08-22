import type { CSSProperties } from "react";

const menuGroups = [
  { label: "OPERAÇÃO", items: [["bi-house-door", "Início", true], ["bi-clock-history", "Histórico"], ["bi-search", "Peças"]] },
  { label: "NEGÓCIO", items: [["bi-box-seam", "Estoque de peças"], ["bi-phone", "Aparelhos"], ["bi-shield-check", "Garantias"], ["bi-people", "Clientes"]] },
  { label: "GESTÃO", items: [["bi-cloud-arrow-up", "Backup"], ["bi-sliders", "Administração"], ["bi-gear", "Configurações"]] },
] as const;

const metrics = [
  ["bi-cash-stack", "Faturamento do mês", "R$ 18.740", "+12% no período"],
  ["bi-receipt", "Ticket médio", "R$ 468", "40 atendimentos"],
  ["bi-stopwatch", "Tempo médio", "1h 35min", "na manutenção"],
  ["bi-tools", "Em andamento", "12", "orçamentos ativos"],
  ["bi-phone", "Estoque disponível", "8", "aparelhos"],
  ["bi-shield-check", "Garantias abertas", "3", "em acompanhamento"],
] as const;

export function ProductPreview() {
  return <div className="product-console" aria-label="Demonstração do aplicativo com os menus reais e dados fictícios">
    <aside className="console-sidebar">
      <div className="console-brand"><span><i className="bi bi-file-earmark-text" /></span><div><strong>LOJA TESTE</strong><small>Assistência técnica</small></div></div>
      <button className="console-new"><i className="bi bi-plus-lg" /> Novo orçamento</button>
      <nav aria-label="Menus demonstrativos do aplicativo">{menuGroups.map((group) => <div className="console-menu-group" key={group.label}><small>{group.label}</small>{group.items.map(([icon, label, active]) => <span className={active ? "active" : ""} key={label}><i className={`bi ${icon}`} /> {label}</span>)}</div>)}</nav>
      <div className="console-user"><span>GS</span><div><strong>Gabriel</strong><small>Administrador</small></div></div>
    </aside>
    <div className="console-main">
      <header><div><small>GESTÃO E FATURAMENTO</small><strong>Visão geral</strong></div><button><i className="bi bi-question-circle" /> Ajuda</button></header>
      <div className="console-content">
        <div className="console-title"><div><small>INÍCIO</small><h3>A operação da loja, sem pontos cegos.</h3><p>Indicadores financeiros e operacionais com dados de demonstração.</p></div><button><i className="bi bi-plus-lg" /> Novo orçamento</button></div>
        <div className="console-periods"><span className="active">Este mês</span><span>Últimos 6 meses</span><span>Último ano</span></div>
        <div className="console-metrics">{metrics.map(([icon,label,value,detail], index) => <article style={{"--delay": `${index * 80}ms`} as CSSProperties} key={label}><i className={`bi ${icon}`} /><small>{label}</small><strong>{value}</strong><em>{detail}</em></article>)}</div>
        <div className="console-panels"><article><div><strong>Precisam de atenção agora</strong><small>Ações prioritárias reunidas em um só lugar</small></div><ul><li><span className="warning">4</span> aguardando aprovação</li><li><span className="info">3</span> aparelhos para análise</li><li><span className="success">2</span> prontos para retirada</li></ul></article><article><div><strong>Resumo da operação</strong><small>O que está acontecendo hoje</small></div><div className="console-status"><span><b>7</b>Em manutenção</span><span><b>5</b>Peças procuradas</span><span><b>8</b>Aparelhos à venda</span><span><b>3</b>Garantias</span></div></article></div>
      </div>
    </div>
  </div>;
}
