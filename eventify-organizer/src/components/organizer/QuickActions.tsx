import React from 'react';
import { Plus, Calendar, Users, Ticket, BarChart3, Mail } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface QuickActionsProps {
  onNavigate: NavigateFunction;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      label: 'Create Event',
      icon: Plus,
      color: 'bg-black text-white hover:bg-black/90',
      iconColor: 'text-white',
      onClick: () => onNavigate('/create-event'),
    },
    {
      label: 'View Events',
      icon: Calendar,
      color: 'bg-card text-foreground border-border hover:bg-accent',
      iconColor: 'text-black',
      onClick: () => onNavigate('/my-events'),
    },
    {
      label: 'Manage Tickets',
      icon: Ticket,
      color: 'bg-card text-foreground border-border hover:bg-accent',
      iconColor: 'text-black', // Black accent
      onClick: () => { },
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      color: 'bg-card text-foreground border-border hover:bg-accent',
      iconColor: 'text-black', // Black accent
      onClick: () => { },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={(action as any).onClick}
          className={`
            ${action.label === 'Create Event'
              ? 'bg-[#E85A6B] text-white border-transparent hover:bg-[#a61043]'
              : 'bg-white text-black border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
            border rounded-lg p-6 flex flex-col items-center justify-center gap-4 transition-all duration-200 group min-h-[120px] shadow-sm
          `}
        >
          <div className={`p-2.5 rounded-full transition-colors ${action.label === 'Create Event' ? 'bg-white/20 text-white' : 'bg-gray-100 text-black group-hover:bg-[#E85A6B]/10 group-hover:text-[#E85A6B]'}`}>
            <action.icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium tracking-wide">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
