'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types/subscription';
import { Users, Activity, AlertCircle, TrendingUp, Building2, MapPin, Calendar, GripVertical } from 'lucide-react';

interface DashboardStatsProps {
  stats: DashboardStats;
}

interface StatsCard {
  id: string;
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bgColor: string;
}

export function DashboardStatsCards({ stats }: DashboardStatsProps) {
  const initialCards: StatsCard[] = [
    {
      id: 'total',
      title: 'Total Subscriptions',
      value: stats.totalSubscriptions,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'active',
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'expired',
      title: 'Expired Subscriptions',
      value: stats.expiredSubscriptions,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'growth',
      title: 'Monthly Growth',
      value: `${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.monthlyGrowth >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      id: 'vendors',
      title: 'Unique Vendors',
      value: stats.uniqueVendors,
      icon: Building2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'locations',
      title: 'Locations',
      value: stats.uniqueLocations,
      icon: MapPin,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'expiry',
      title: 'Next Month Expiry',
      value: stats.nextMonthExpiry,
      icon: Calendar,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ];

  const [cards, setCards] = useState<StatsCard[]>(initialCards);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverCard, setDragOverCard] = useState<string | null>(null);

  // Update card values when stats change
  useEffect(() => {
    setCards(prevCards => 
      prevCards.map(card => {
        const updatedCard = initialCards.find(c => c.id === card.id);
        return updatedCard ? { ...card, ...updatedCard } : card;
      })
    );
  }, [stats]);

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault();
    setDragOverCard(cardId);
  };

  const handleDragLeave = () => {
    setDragOverCard(null);
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard === targetCardId) {
      setDraggedCard(null);
      setDragOverCard(null);
      return;
    }

    const draggedIndex = cards.findIndex(card => card.id === draggedCard);
    const targetIndex = cards.findIndex(card => card.id === targetCardId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCards = [...cards];
    const [removed] = newCards.splice(draggedIndex, 1);
    newCards.splice(targetIndex, 0, removed);

    setCards(newCards);
    setDraggedCard(null);
    setDragOverCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverCard(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isDragging = draggedCard === card.id;
        const isDragOver = dragOverCard === card.id;
        
        return (
          <Card 
            key={card.id}
            draggable
            onDragStart={(e) => handleDragStart(e, card.id)}
            onDragOver={(e) => handleDragOver(e, card.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, card.id)}
            onDragEnd={handleDragEnd}
            className={`
              cursor-move transition-all duration-200 hover:shadow-md
              ${isDragging ? 'opacity-50 scale-95 rotate-2' : ''}
              ${isDragOver ? 'ring-2 ring-blue-400 ring-offset-2 scale-105' : ''}
            `}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}