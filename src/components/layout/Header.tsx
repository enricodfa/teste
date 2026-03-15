interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 h-[60px] bg-white border-b border-gray-100 flex items-center px-7 z-30">
      <div>
        {subtitle && (
          <div className="uppercase tracking-wider text-[11px] text-gray-400 font-medium mb-px">
            {subtitle}
          </div>
        )}
        <h1 className="text-[15px] font-bold text-[#121212] tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
