interface IconProps { size?: number }

export function BTCIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      {/* Bitcoin ₿ shape */}
      <path
        d="M21.5 13.6c.25-1.7-1.04-2.6-2.8-3.2l.57-2.3-1.4-.35-.56 2.24-1.1-.28.56-2.25-1.4-.35-.57 2.3-.87-.22-1.93-.48-.37 1.5s1.04.24.98.25c.55.14.65.5.63.79l-.75 3c.06.01.14.03.23.06l-.24-.06-1.05 4.22c-.08.18-.28.45-.73.35 0 0-.97-.24-.97-.24l-.66 1.6 1.82.46.99.25-.58 2.33 1.4.35.57-2.3 1.11.28-.57 2.3 1.4.35.57-2.32c2.3.44 4.04.26 4.77-1.82.58-1.73-.03-2.73-1.28-3.38.91-.21 1.6-.82 1.78-2.08zm-3.18 4.46c-.41 1.65-3.2.76-4.1.54l.73-2.93c.9.22 3.78.66 3.37 2.39zm.41-4.47c-.37 1.5-2.68.74-3.43.55l.66-2.65c.75.19 3.17.55 2.77 2.1z"
        fill="white"
      />
    </svg>
  );
}

export function ETHIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      {/* Ethereum diamond prism */}
      <polygon points="16,5.5 8,16.5 16,13.5" fill="white" opacity="0.6" />
      <polygon points="16,5.5 24,16.5 16,13.5" fill="white" opacity="0.95" />
      <polygon points="8,16.5 16,13.5 16,20.5" fill="white" opacity="0.4" />
      <polygon points="24,16.5 16,13.5 16,20.5" fill="white" opacity="0.65" />
      <polygon points="8,16.5 16,20.5 16,26.5" fill="white" opacity="0.6" />
      <polygon points="24,16.5 16,20.5 16,26.5" fill="white" opacity="0.95" />
    </svg>
  );
}

export function SUIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#4DA2FF" />
      {/* SUI — three water-drop shapes */}
      {/* Left drop */}
      <ellipse cx="11.5" cy="19" rx="3" ry="4.5" fill="white" />
      <circle cx="11.5" cy="14" r="2.5" fill="white" />
      {/* Right drop */}
      <ellipse cx="20.5" cy="19" rx="3" ry="4.5" fill="white" />
      <circle cx="20.5" cy="14" r="2.5" fill="white" />
      {/* Center top drop */}
      <ellipse cx="16" cy="11.5" rx="3" ry="4.5" fill="white" />
      <circle cx="16" cy="6.5" r="2.5" fill="white" />
    </svg>
  );
}

export function AVAXIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#E84142" />
      {/* Avalanche "A" — outer triangle minus inner triangle */}
      <path
        d="M16 6L26 24H6L16 6Z"
        fill="white"
      />
      <path
        d="M16 13.5L20.5 22H11.5L16 13.5Z"
        fill="#E84142"
      />
    </svg>
  );
}

export function CryptoIcon({ ticker, size = 32 }: { ticker: string; size?: number }) {
  switch (ticker.toUpperCase()) {
    case 'BTC':  return <BTCIcon size={size} />;
    case 'ETH':  return <ETHIcon size={size} />;
    case 'SUI':  return <SUIcon size={size} />;
    case 'AVAX': return <AVAXIcon size={size} />;
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#E2E5EE" />
          <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280">
            {ticker.slice(0, 3)}
          </text>
        </svg>
      );
  }
}
