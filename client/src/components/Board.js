import React from 'react';
import { Column } from './Column';
import { DraggableCard } from './Card';

export function Board({ cards, columns, moveCard }) {
  return (
    <div className="Board col-sm-3">
      {columns.map(column => (
        <Column
          key={column.id}
          title={column.title}
        >
          {column.cardIds
            .map(cardId => cards.find(card => card.id === cardId))
            .map((card, index) => (
              <DraggableCard
                key={card.id}
                id={card.id}
                columnId={column.id}
                columnIndex={index}
                title={card.title}
                moveCard={moveCard}
              />
            ))}
          {column.cardIds.length === 0 && (
            <DraggableCard
              isSpacer
              moveCard={cardId => moveCard(cardId, column.id, 0)}
            />
          )}
        </Column>
      ))}
    </div>
  );
}
