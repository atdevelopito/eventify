import React from 'react';
import { Search, CalendarCheck, PartyPopper } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Search,
      step: '01',
      title: 'Discover',
      description: 'Browse through hundreds of events happening near you or filter by category.',
    },
    {
      icon: CalendarCheck,
      step: '02',
      title: 'Register',
      description: 'Found something you love? Register with just one click and save it to your calendar.',
    },
    {
      icon: PartyPopper,
      step: '03',
      title: 'Attend',
      description: 'Show up, have fun, and connect with your community at amazing events.',
    },
  ];

  return (
    <section className="px-4 md:px-8 py-12 md:py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Finding and attending events has never been easier. Here's how to get started.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-background border-2 border-primary mb-6">
                  <item.icon className="w-10 h-10 text-primary" />
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
