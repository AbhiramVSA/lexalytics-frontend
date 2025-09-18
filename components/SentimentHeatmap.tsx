"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentData, HeatmapCell } from '@/types/sentiment';

interface SentimentHeatmapProps {
  data: { [key: string]: SentimentData };
  title?: string;
  className?: string;
}

const SentimentHeatmap: React.FC<SentimentHeatmapProps> = ({ 
  data, 
  title = "SENTIMENT ANALYSIS", 
  className = "" 
}) => {
  // Calculate the heatmap cells with intensity values
  const heatmapCells = useMemo(() => {
    const cells: HeatmapCell[] = [];
    const allTotals = Object.values(data).map(sentiment => 
      sentiment.positive + sentiment.negative + sentiment.neutral
    );
    const maxTotal = Math.max(...allTotals, 1); // Avoid division by zero

    Object.entries(data).forEach(([key, sentiment]) => {
      const total = sentiment.positive + sentiment.negative + sentiment.neutral;
      const intensity = total / maxTotal;

      cells.push({
        id: key,
        label: key,
        sentiment,
        intensity
      });
    });

    return cells;
  }, [data]);

  // Get the dominant sentiment for a cell
  const getDominantSentiment = (sentiment: SentimentData) => {
    const { positive, negative, neutral } = sentiment;
    if (positive >= negative && positive >= neutral) return 'positive';
    if (negative >= positive && negative >= neutral) return 'negative';
    return 'neutral';
  };

  // Get color based on dominant sentiment and intensity
  const getCellColor = (cell: HeatmapCell) => {
    const dominant = getDominantSentiment(cell.sentiment);
    const intensity = Math.max(0.2, cell.intensity); // Minimum visibility
    
    switch (dominant) {
      case 'positive':
        return `rgba(34, 197, 94, ${intensity})`; // Green
      case 'negative':
        return `rgba(239, 68, 68, ${intensity})`; // Red
      case 'neutral':
        return `rgba(156, 163, 175, ${intensity})`; // Gray
      default:
        return `rgba(156, 163, 175, ${intensity})`;
    }
  };

  // Get text color for readability
  const getTextColor = (cell: HeatmapCell) => {
    const dominant = getDominantSentiment(cell.sentiment);
    return cell.intensity > 0.5 ? '#ffffff' : 
           dominant === 'positive' ? '#16a34a' :
           dominant === 'negative' ? '#dc2626' : '#6b7280';
  };

  return (
    <Card className={`bg-neutral-900 border-neutral-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {heatmapCells.map((cell) => {
            const total = cell.sentiment.positive + cell.sentiment.negative + cell.sentiment.neutral;
            const dominant = getDominantSentiment(cell.sentiment);
            
            return (
              <div
                key={cell.id}
                className="aspect-square p-2 rounded border border-neutral-700 hover:border-neutral-500 transition-all duration-200 cursor-pointer group relative"
                style={{ 
                  backgroundColor: getCellColor(cell),
                  color: getTextColor(cell)
                }}
              >
                <div className="flex flex-col h-full justify-between text-xs">
                  <div className="font-mono text-[10px] opacity-80 truncate">
                    {cell.label}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm">{total}</div>
                    <div className="text-[10px] opacity-75 uppercase tracking-wider">
                      {dominant}
                    </div>
                  </div>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                  <div className="text-center">
                    <div className="font-semibold">{cell.label}</div>
                    <div className="text-green-400">Positive: {cell.sentiment.positive}</div>
                    <div className="text-red-400">Negative: {cell.sentiment.negative}</div>
                    <div className="text-gray-400">Neutral: {cell.sentiment.neutral}</div>
                    <div className="text-white font-mono">Total: {total}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-neutral-400">Positive</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-neutral-400">Negative</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-gray-500"></div>
            <span className="text-neutral-400">Neutral</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentHeatmap;
