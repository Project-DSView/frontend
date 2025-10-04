import React from 'react';
import { DragDropZoneProps } from '@/types';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  // Function to validate required inputs for each operation
  const validateOperation = (op: {
    type: string;
    name: string;
    value?: string | null;
    position?: string | null;
    newValue?: string | null;
    endVertex?: string | null;
  }) => {
    const errors: string[] = [];

    // Check for required value input
    if (
      [
        'insert_beginning',
        'insert_end',
        'insert_position',
        'search_value',
        'update_value',
        'push',
        'add_vertex',
        'remove_vertex',
      ].includes(op.type)
    ) {
      if (!op.value || op.value.trim() === '') {
        errors.push(`กรุณาใส่ค่า Value สำหรับ ${op.name}`);
      }
    }

    // Check for required position input
    if (
      [
        'insert_position',
        'delete_position',
        'search_position',
        'update_position',
        'add_edge',
        'remove_edge',
      ].includes(op.type)
    ) {
      if (!op.position || op.position.trim() === '') {
        errors.push(`กรุณาใส่ค่า Position สำหรับ ${op.name}`);
      }
    }

    // Check for required newValue input
    if (['update_value', 'update_position', 'add_edge', 'remove_edge'].includes(op.type)) {
      if (!op.newValue || op.newValue.trim() === '') {
        errors.push(`กรุณาใส่ค่า New Value สำหรับ ${op.name}`);
      }
    }

    // Check for required endVertex input (stored in value field for shortest_path)
    if (op.type === 'shortest_path') {
      if (!op.value || op.value.trim() === '') {
        errors.push(`กรุณาใส่ค่า End Vertex สำหรับ ${op.name}`);
      }
    }

    // Check for required weight input for add_edge
    if (op.type === 'add_edge') {
      if (!op.value || op.value.trim() === '') {
        errors.push(`กรุณาใส่ค่า Weight สำหรับ ${op.name}`);
      }
    }

    return errors;
  };

  // Function to handle input validation
  const handleInputValidation = (
    op: {
      id: number;
      type: string;
      name: string;
      value?: string | null;
      position?: string | null;
      newValue?: string | null;
    },
    field: string,
    value: string,
  ) => {
    // Update the operation first
    if (field === 'value') {
      onUpdateOperationValue(op.id, value);
    } else if (field === 'position') {
      onUpdateOperationPosition(op.id, value);
    } else if (field === 'newValue') {
      onUpdateOperationNewValue(op.id, value);
    } else if (field === 'endVertex') {
      onUpdateOperationValue(op.id, value); // endVertex is stored in value field
    }

    // Validate after a short delay to allow the state to update
    setTimeout(() => {
      const errors = validateOperation({ ...op, [field]: value });
      if (errors.length > 0) {
        errors.forEach((error) => toast.warning(error));
      }
    }, 100);
  };

  // Function to get input validation class
  const getInputValidationClass = (
    op: {
      type: string;
      name: string;
      value?: string | null;
      position?: string | null;
      newValue?: string | null;
    },
    field: string,
  ) => {
    const errors = validateOperation(op);
    const hasError = errors.some((error) =>
      error.includes(field === 'value' ? 'Value' : field === 'position' ? 'Position' : 'New Value'),
    );
    return hasError ? 'border-error bg-error bg-error/10' : 'border-neutral';
  };
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
                  'push',
                  'add_vertex',
                  'remove_vertex',
                ].includes(op.type) && (
                  <input
                    type="text"
                    placeholder="Value"
                    value={op.value || ''}
                    onChange={(e) => handleInputValidation(op, 'value', e.target.value)}
                    className={`w-24 rounded border px-2 py-1 text-center text-sm ${getInputValidationClass(op, 'value')}`}
                  />
                )}

                {/* Value Select for update_value operation */}
                {op.type === 'update_value' && (
                  <Select
                    value={op.value || ''}
                    onValueChange={(value) => handleInputValidation(op, 'value', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'value')}`}>
                      <SelectValue placeholder="Select Value" />
                    </SelectTrigger>
                    <SelectContent>
                      {operations
                        .filter(
                          (otherOp) =>
                            ['insert_beginning', 'insert_end', 'insert_position'].includes(
                              otherOp.type,
                            ) && otherOp.value,
                        )
                        .map((valueOp) => (
                          <SelectItem key={valueOp.id} value={valueOp.value || ''}>
                            {valueOp.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Number input for BST operations */}
                {['insert', 'delete', 'search'].includes(op.type) && (
                  <input
                    type="number"
                    placeholder="Number"
                    value={op.value || ''}
                    onChange={(e) => handleInputValidation(op, 'value', e.target.value)}
                    className={`w-24 rounded border px-2 py-1 text-center text-sm ${getInputValidationClass(op, 'value')}`}
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
                ].includes(op.type) && (
                  <input
                    type="number"
                    placeholder="Position"
                    value={op.position || ''}
                    onChange={(e) => handleInputValidation(op, 'position', e.target.value)}
                    className={`w-24 rounded border px-2 py-1 text-center text-sm ${getInputValidationClass(op, 'position')}`}
                  />
                )}

                {/* From Vertex Select for edge operations */}
                {['add_edge', 'remove_edge'].includes(op.type) && (
                  <Select
                    value={op.position || ''}
                    onValueChange={(value) => handleInputValidation(op, 'position', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'position')}`}>
                      <SelectValue placeholder="From Vertex" />
                    </SelectTrigger>
                    <SelectContent>
                      {operations
                        .filter((otherOp) => otherOp.type === 'add_vertex' && otherOp.value)
                        .map((vertexOp) => (
                          <SelectItem key={vertexOp.id} value={vertexOp.value || ''}>
                            {vertexOp.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}

                {/* New Value input for update operations */}
                {['update_value', 'update_position'].includes(op.type) && (
                  <input
                    type="text"
                    placeholder="New Value"
                    value={op.newValue || ''}
                    onChange={(e) => handleInputValidation(op, 'newValue', e.target.value)}
                    className={`w-24 rounded border px-2 py-1 text-center text-sm ${getInputValidationClass(op, 'newValue')}`}
                  />
                )}

                {/* To Vertex Select for edge operations */}
                {['add_edge', 'remove_edge'].includes(op.type) && (
                  <Select
                    value={op.newValue || ''}
                    onValueChange={(value) => handleInputValidation(op, 'newValue', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'newValue')}`}>
                      <SelectValue placeholder="To Vertex" />
                    </SelectTrigger>
                    <SelectContent>
                      {operations
                        .filter((otherOp) => otherOp.type === 'add_vertex' && otherOp.value)
                        .map((vertexOp) => (
                          <SelectItem key={vertexOp.id} value={vertexOp.value || ''}>
                            {vertexOp.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Start Vertex input for traversal operations */}
                {['traversal_dfs', 'traversal_bfs', 'shortest_path'].includes(op.type) && (
                  <input
                    type="text"
                    placeholder="Start Vertex"
                    value={op.newValue || ''}
                    onChange={(e) => handleInputValidation(op, 'newValue', e.target.value)}
                    className={`w-24 rounded border px-2 py-1 text-center text-sm ${getInputValidationClass(op, 'newValue')}`}
                  />
                )}

                {/* End Vertex input for shortest_path */}
                {op.type === 'shortest_path' && (
                  <input
                    type="text"
                    placeholder="End Vertex"
                    value={op.endVertex || ''}
                    onChange={(e) => handleInputValidation(op, 'endVertex', e.target.value)}
                    className={`w-24 rounded border px-2 py-1 text-center text-sm ${getInputValidationClass(op, 'endVertex')}`}
                  />
                )}

                {/* Weight input for add_edge (integer) */}
                {op.type === 'add_edge' && (
                  <input
                    type="number"
                    placeholder="Weight"
                    value={op.value || ''}
                    onChange={(e) => handleInputValidation(op, 'value', e.target.value)}
                    className={`w-24 rounded border px-2 py-1 text-center text-sm ${getInputValidationClass(op, 'value')}`}
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
