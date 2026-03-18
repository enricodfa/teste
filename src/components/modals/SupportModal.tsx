'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Mail, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SupportModal({ open, onClose }: SupportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape or Outside Click
  useEffect(() => {
    if (!open) return;

    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };

    document.addEventListener('keydown', onEsc);
    document.addEventListener('mousedown', onOutside);
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="bg-white rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-[420px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-violet-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
              <HelpCircle size={20} className="text-violet-600" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">Ajuda & Suporte</h2>
              <p className="text-[13px] text-gray-500 font-medium">Como podemos ajudar você hoje?</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-3">
          {/* Option 1: WhatsApp */}
          <a 
            href="https://wa.me/5511999999999" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-[16px] border border-gray-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 group transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MessageCircle size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-gray-900">Atendimento via WhatsApp</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">Fale diretamente com nossa equipe técnica.</p>
            </div>
            <ExternalLink size={14} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </a>

          {/* Option 2: Email */}
          <a 
            href="mailto:suporte@nortfy.com"
            className="flex items-center gap-4 p-4 rounded-[16px] border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 group transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Mail size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-gray-900">Suporte via E-mail</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">Para problemas complexos e envio de anexos.</p>
            </div>
            <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </a>

          {/* Option 3: Documentation */}
          <a 
            href="https://docs.nortfy.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-[16px] border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 group transition-all mt-2"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BookOpen size={20} className="text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-gray-900">Central de Ajuda</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">Acesse os guias, tutoriais e dúvidas frequentes.</p>
            </div>
            <ExternalLink size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </a>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[12px] font-medium text-gray-400">
            Horário de atendimento: Segunda a Sexta, das 09h às 18h.
          </p>
        </div>
      </div>
    </div>
  );
}
