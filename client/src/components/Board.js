import React from 'react';
import { Column } from './Column';
import { DraggableCard } from './Card';
import Button from 'react-bootstrap/Button';

export function Board({ cards, columns, moveCard, projectID }) {
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
          <Button key={column.id} onClick={() => {
            const add_issues_url = "/issues/new";
            
          }} variant="light" >Add Issue</Button>
        </Column>
      ))}
    </div>
  );
}
