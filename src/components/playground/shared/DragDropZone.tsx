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
  onUpdateOperationSourceStack,
  onUpdateOperationTargetStack,
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
    sourceStack?: string | null;
    targetStack?: string | null;
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
      ].includes(op.type)
    ) {
      if (!op.value || op.value.trim() === '') {
        errors.push(`กรุณาใส่ค่า Value สำหรับ ${op.name}`);
      }
    }

    // Check for required value selection for delete_value
    if (op.type === 'delete_value') {
      if (!op.value || op.value.trim() === '') {
        errors.push(`กรุณาเลือก Value สำหรับ ${op.name}`);
      }
    }

    // Check for required node selection for BST delete
    if (op.type === 'delete') {
      if (!op.value || op.value.trim() === '') {
        errors.push(`กรุณาเลือก Node สำหรับ ${op.name}`);
      }
    }

    // Check for required vertex selection for remove_vertex
    if (op.type === 'remove_vertex') {
      if (!op.value || op.value.trim() === '') {
        errors.push(`กรุณาเลือก Vertex สำหรับ ${op.name}`);
      }
    }

    // Check for required sourceStack and targetStack for copyStack
    if (op.type === 'copyStack') {
      if (!op.sourceStack || op.sourceStack.trim() === '') {
        errors.push(`กรุณาเลือก Source Stack สำหรับ ${op.name}`);
      }
      if (!op.targetStack || op.targetStack.trim() === '') {
        errors.push(`กรุณาเลือก Target Stack สำหรับ ${op.name}`);
      }
    }

    // Check for required targetStack for push and pop
    if (op.type === 'push' || op.type === 'pop') {
      if (!op.targetStack || op.targetStack.trim() === '') {
        errors.push(`กรุณาเลือก Target Stack สำหรับ ${op.name}`);
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
      sourceStack?: string | null;
      targetStack?: string | null;
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
    } else if (field === 'sourceStack' && onUpdateOperationSourceStack) {
      onUpdateOperationSourceStack(op.id, value);
    } else if (field === 'targetStack' && onUpdateOperationTargetStack) {
      onUpdateOperationTargetStack(op.id, value);
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
      sourceStack?: string | null;
      targetStack?: string | null;
    },
    field: string,
  ) => {
    const errors = validateOperation(op);
    const hasError = errors.some((error) => {
      if (field === 'value') return error.includes('Value') || error.includes('Vertex');
      if (field === 'position') return error.includes('Position');
      if (field === 'newValue') return error.includes('New Value');
      if (field === 'sourceStack') return error.includes('Source Stack');
      if (field === 'targetStack') return error.includes('Target Stack');
      return false;
    });
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
                  'search_value',
                  'push',
                  'add_vertex',
                ].includes(op.type) && (
                  <input
                    type="text"
                    placeholder="Value"
                    value={op.value || ''}
                    onChange={(e) => handleInputValidation(op, 'value', e.target.value)}
                    className={`w-24 rounded border px-2 py-1 text-center text-sm ${getInputValidationClass(op, 'value')}`}
                  />
                )}

                {/* Delete by Value Select for linked list operations */}
                {op.type === 'delete_value' && (
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

                {/* Remove Vertex Select */}
                {op.type === 'remove_vertex' && (
                  <Select
                    value={op.value || ''}
                    onValueChange={(value) => handleInputValidation(op, 'value', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'value')}`}>
                      <SelectValue placeholder="Select Vertex" />
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

                {/* Number input for BST insert and search operations */}
                {['insert', 'search'].includes(op.type) && (
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

                {/* BST Delete Node Select */}
                {op.type === 'delete' && (
                  <Select
                    value={op.value || ''}
                    onValueChange={(value) => handleInputValidation(op, 'value', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'value')}`}>
                      <SelectValue placeholder="Select Node" />
                    </SelectTrigger>
                    <SelectContent>
                      {operations
                        .filter((otherOp) => otherOp.type === 'insert' && otherOp.value)
                        .map((insertOp) => (
                          <SelectItem key={insertOp.id} value={insertOp.value || ''}>
                            {insertOp.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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

                {/* Start Vertex Select for traversal operations */}
                {['traversal_dfs', 'traversal_bfs', 'shortest_path'].includes(op.type) && (
                  <Select
                    value={op.newValue || ''}
                    onValueChange={(value) => handleInputValidation(op, 'newValue', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'newValue')}`}>
                      <SelectValue placeholder="Start Vertex" />
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

                {/* End Vertex Select for shortest_path */}
                {op.type === 'shortest_path' && (
                  <Select
                    value={op.endVertex || ''}
                    onValueChange={(value) => handleInputValidation(op, 'endVertex', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'endVertex')}`}>
                      <SelectValue placeholder="End Vertex" />
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

                {/* Source Stack Select for copyStack operation */}
                {op.type === 'copyStack' && (
                  <Select
                    value={op.sourceStack || ''}
                    onValueChange={(value) => handleInputValidation(op, 'sourceStack', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'sourceStack')}`}>
                      <SelectValue placeholder="Source Stack" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s1">Stack s1</SelectItem>
                      <SelectItem value="s2">Stack s2</SelectItem>
                      <SelectItem value="main">Main Stack</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Target Stack Select for copyStack operation */}
                {op.type === 'copyStack' && (
                  <Select
                    value={op.targetStack || ''}
                    onValueChange={(value) => handleInputValidation(op, 'targetStack', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'targetStack')}`}>
                      <SelectValue placeholder="Target Stack" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s1">Stack s1</SelectItem>
                      <SelectItem value="s2">Stack s2</SelectItem>
                      <SelectItem value="main">Main Stack</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Target Stack Select for push operation */}
                {op.type === 'push' && (
                  <Select
                    value={op.targetStack || ''}
                    onValueChange={(value) => handleInputValidation(op, 'targetStack', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'targetStack')}`}>
                      <SelectValue placeholder="Target Stack" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s1">Stack s1</SelectItem>
                      <SelectItem value="s2">Stack s2</SelectItem>
                      <SelectItem value="main">Main Stack</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {op.type === 'pop' && (
                  <Select
                    value={op.targetStack || ''}
                    onValueChange={(value) => handleInputValidation(op, 'targetStack', value)}
                  >
                    <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'targetStack')}`}>
                      <SelectValue placeholder="Target Stack" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s1">Stack s1</SelectItem>
                      <SelectItem value="s2">Stack s2</SelectItem>
                      <SelectItem value="main">Main Stack</SelectItem>
                    </SelectContent>
                  </Select>
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
