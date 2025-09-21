import React from 'react';
import { Operation } from '@/types';

interface DragDropZoneProps {
  operations: Operation[];
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveOperation: (id: number) => void;
  onUpdateOperationValue: (id: number, value: string) => void;
  onUpdateOperationPosition: (id: number, position: string) => void;
  onUpdateOperationNewValue: (id: number, newValue: string) => void;
  children?: React.ReactNode;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({
  operations,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onRemoveOperation,
  onUpdateOperationValue,
  onUpdateOperationPosition,
  onUpdateOperationNewValue,
  children,
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="min-h-[300px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4"
    >
      {operations.length === 0 ? (
        <div className="flex h-full items-center justify-center text-gray-400">
          ลาก operations มาที่นี่
        </div>
      ) : (
        <div className="space-y-3">
          {operations.map((op, index) => (
            <div key={op.id} className={`${op.color} rounded-lg border p-3`}>
              <div className="mb-2 flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                <span className="text-sm font-medium">{op.name}</span>
                <button
                  onClick={() => onRemoveOperation(op.id)}
                  className="ml-auto font-bold text-error hover:text-error/50"
                >
                  ✕
                </button>
              </div>

              {/* Input fields based on operation type */}
              <div className="flex space-x-2">
                {/* Value input for operations that need it */}
                {[
                  'insert_beginning',
                  'insert_end',
                  'insert_position',
                  'delete_value',
                  'search_value',
                  'update_value',
                ].includes(op.type) && (
                  <input
                    type="text"
                    placeholder="Value"
                    value={op.value || ''}
                    onChange={(e) => onUpdateOperationValue(op.id, e.target.value)}
                    className="w-24 rounded border px-2 py-1 text-center text-sm"
                  />
                )}

                {/* Position input for operations that need it */}
                {[
                  'insert_position',
                  'delete_position',
                  'search_position',
                  'update_position',
                ].includes(op.type) && (
                  <input
                    type="number"
                    placeholder="Position"
                    value={op.position || ''}
                    onChange={(e) => onUpdateOperationPosition(op.id, e.target.value)}
                    className="w-24 rounded border px-2 py-1 text-center text-sm"
                  />
                )}

                {/* New Value input for update operations */}
                {['update_value', 'update_position'].includes(op.type) && (
                  <input
                    type="text"
                    placeholder="New Value"
                    value={op.newValue || ''}
                    onChange={(e) => onUpdateOperationNewValue(op.id, e.target.value)}
                    className="w-24 rounded border px-2 py-1 text-center text-sm"
                  />
                )}

                {/* Show operation type */}
                <div className="flex items-center text-xs text-gray-500">
                  {op.category === 'insertion' && 'Insertion'}
                  {op.category === 'deletion' && 'Deletion'}
                  {op.category === 'traversal' && 'Traversal'}
                  {op.category === 'searching' && 'Searching'}
                  {op.category === 'update' && 'Update'}
                  {op.category === 'utility' && 'Utility'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
};

export default DragDropZone
