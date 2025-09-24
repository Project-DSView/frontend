import React from 'react';
import { DragDropZoneProps } from '@/types';

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
                  className="text-error hover:text-error/50 ml-auto font-bold"
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
                  'push',
                  'add_vertex',
                  'remove_vertex',
                ].includes(op.type) && (
                  <input
                    type="text"
                    placeholder="Value"
                    value={op.value || ''}
                    onChange={(e) => onUpdateOperationValue(op.id, e.target.value)}
                    className="w-24 rounded border px-2 py-1 text-center text-sm"
                  />
                )}

                {/* Number input for BST operations */}
                {['insert', 'delete', 'search'].includes(op.type) && (
                  <input
                    type="number"
                    placeholder="Number"
                    value={op.value || ''}
                    onChange={(e) => onUpdateOperationValue(op.id, e.target.value)}
                    className="w-24 rounded border px-2 py-1 text-center text-sm"
                    min="0"
                    step="1"
                  />
                )}

                {/* Position input for operations that need it */}
                {[
                  'insert_position',
                  'delete_position',
                  'search_position',
                  'update_position',
                  'add_edge',
                  'remove_edge',
                ].includes(op.type) && (
                  <input
                    type={['add_edge', 'remove_edge'].includes(op.type) ? "text" : "number"}
                    placeholder={['add_edge', 'remove_edge'].includes(op.type) ? "From Vertex" : "Position"}
                    value={op.position || ''}
                    onChange={(e) => onUpdateOperationPosition(op.id, e.target.value)}
                    className="w-24 rounded border px-2 py-1 text-center text-sm"
                  />
                )}

                {/* New Value input for update operations and edge operations */}
                {['update_value', 'update_position', 'add_edge', 'remove_edge', 'traversal_dfs', 'traversal_bfs', 'shortest_path'].includes(op.type) && (
                  <input
                    type="text"
                    placeholder={
                      ['add_edge', 'remove_edge'].includes(op.type) ? "To Vertex" :
                      ['traversal_dfs', 'traversal_bfs', 'shortest_path'].includes(op.type) ? "Start Vertex" :
                      "New Value"
                    }
                    value={op.newValue || ''}
                    onChange={(e) => onUpdateOperationNewValue(op.id, e.target.value)}
                    className="w-24 rounded border px-2 py-1 text-center text-sm"
                  />
                )}

                {/* End Vertex input for shortest_path */}
                {op.type === 'shortest_path' && (
                  <input
                    type="text"
                    placeholder="End Vertex"
                    value={op.endVertex || ''}
                    onChange={(e) => onUpdateOperationValue(op.id, e.target.value)}
                    className="w-24 rounded border px-2 py-1 text-center text-sm"
                  />
                )}

                {/* Weight input for add_edge (integer) */}
                {op.type === 'add_edge' && (
                  <input
                    type="number"
                    placeholder="Weight"
                    value={op.value || ''}
                    onChange={(e) => onUpdateOperationValue(op.id, e.target.value)}
                    className="w-24 rounded border px-2 py-1 text-center text-sm"
                    step="1"
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

export default DragDropZone;
