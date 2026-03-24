'use client';

import { Bell } from 'lucide-react';
import PortfolioPanel from './PortfolioPanel';

interface HeaderProps {
  title:     string;
  subtitle?: string;
  actions?:  React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header style={{
      minHeight: 'var(--header-height, 72px)', // minHeight permite o padding expandir a barra se necessário
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', 
      alignItems: 'center',
      padding: '20px 32px', // 20px em cima e embaixo (centraliza perfeito), 32px nas laterais
      gap: 16,
      position: 'sticky', 
      top: 0, 
      zIndex: 30,
    }}>

      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle && (
          <div style={{ 
            fontSize: 11, 
            color: 'var(--t4)', 
            marginBottom: 4, 
            fontWeight: 600, 
            letterSpacing: '0.04em', 
            textTransform: 'uppercase' 
          }}>
            {subtitle}
          </div>
        )}
        <h1 style={{
          fontSize: 18, // Dei um leve up na fonte para bater com o peso da sua imagem
          fontWeight: 700, 
          color: 'var(--t1)',
          margin: 0, 
          letterSpacing: '-0.015em',
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
        }}>
          {title}
        </h1>
      </div>

      {actions}

      {/* Removi a margem forçada daqui, o padding lateral de 32px do header já resolve isso de forma mais limpa */}
      <div>
        <PortfolioPanel />
      </div>

    </header>
  );
}