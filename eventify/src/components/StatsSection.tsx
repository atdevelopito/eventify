import React from 'react';
import { Calendar, Users, MapPin, Sparkles } from 'lucide-react';

interface StatsSectionProps {
  eventsCount: number;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ eventsCount }) => {
  const stats = [
    {
      icon: Calendar,
      value: eventsCount.toString(),
      label: 'Events Listed',
    },
    {
      icon: Users,
      value: '10K+',
      label: 'Active Users',
    },
    {
      icon: MapPin,
      value: '50+',
      label: 'Cities',
    },
    {
      icon: Sparkles,
      value: '100%',
      label: 'Free to Use',
    },
  ];

  return (
    <section className="px-4 md:px-8 py-12 md:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-primary" />
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
