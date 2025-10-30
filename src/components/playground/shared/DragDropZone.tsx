import React, { useState } from 'react';
import { toast } from 'sonner';

import { DragDropZoneProps } from '@/types';

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
  onReorderOperation,
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

  // Reordering state and handlers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isExternalDrag, setIsExternalDrag] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation(); // Prevent triggering parent drag handlers
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'reorder', index }));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle internal reorder, ignore external drags
    const hasJsonData = e.dataTransfer.types.includes('application/json');
    if (!hasJsonData) {
      return; // External drag - ignore
    }

    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle internal reorder, ignore external drags
    const hasJsonData = e.dataTransfer.types.includes('application/json');
    if (!hasJsonData) {
      return; // External drag - ignore
    }

    // Only clear if we're leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle internal reorder, ignore external drags
    const hasJsonData = e.dataTransfer.types.includes('application/json');
    if (!hasJsonData) {
      return; // External drag - ignore
    }

    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorderOperation) {
      onReorderOperation(draggedIndex, dropIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const handleMainDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    // Check if it's internal reorder by looking for JSON data
    const hasJsonData = e.dataTransfer.types.includes('application/json');

    if (hasJsonData) {
      // Internal reorder - don't show external drag feedback
      setIsExternalDrag(false);
    } else {
      // External drag - show feedback and allow drop
      setIsExternalDrag(true);
      onDragOver(e);
    }
  };

  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if it's internal reorder
    const hasJsonData = e.dataTransfer.types.includes('application/json');

    if (hasJsonData) {
      // Internal reorder - ignore in main handler, let block handlers deal with it
      setIsExternalDrag(false);
      return;
    }

    // External drag - add to end
    setIsExternalDrag(false);
    onDrop(e);
  };

  const handleMainDragLeave = (e: React.DragEvent) => {
    // Only clear external drag state if leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsExternalDrag(false);
    }
    onDragLeave(e);
  };

  return (
    <div
      onDragOver={handleMainDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={handleMainDragLeave}
      onDrop={handleMainDrop}
      className={`min-h-[300px] w-full rounded-lg border-2 border-dashed p-4 transition-all duration-200 ${
        isExternalDrag
          ? 'border-blue-400 bg-blue-50 shadow-lg dark:border-blue-600 dark:bg-blue-900/30'
          : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
      }`}
      style={{ position: 'relative' }}
    >
      {operations.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
          ลาก operations มาที่นี่
        </div>
      ) : isExternalDrag ? (
        <>
          {/* Overlay for external drag to prevent collision with blocks */}
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
            <div className="text-center font-medium text-blue-600 dark:text-blue-400">
              <div>วางเพื่อเพิ่มต่อท้าย</div>
            </div>
          </div>
          {/* Show existing blocks behind overlay */}
          <div className="opacity-50">
            <div
              className={`space-y-3 ${operations.length >= 5 ? 'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 max-h-96 overflow-y-auto' : ''}`}
            >
              {operations.map((op, index) => (
                <div key={op.id} className={`${op.color} rounded-lg border p-3`}>
                  <div className="mb-2 flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{op.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div
          className={`space-y-3 ${operations.length >= 5 ? 'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 max-h-96 overflow-y-auto' : ''}`}
        >
          {operations.map((op, index) => (
            <div key={op.id} className="relative">
              {/* Drop indicator line - show above the target */}
              {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                <div className="absolute -top-2 right-0 left-0 z-20 h-1 rounded-full bg-blue-500 shadow-lg dark:bg-blue-600" />
              )}

              {/* Drop indicator line - show below if dragging to last position */}
              {dragOverIndex === index &&
                draggedIndex !== null &&
                draggedIndex !== index &&
                index === operations.length - 1 && (
                  <div className="absolute right-0 -bottom-2 left-0 z-20 h-1 rounded-full bg-blue-500 shadow-lg dark:bg-blue-600" />
                )}

              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`${op.color} cursor-move rounded-lg border p-3 transition-all duration-200 ${
                  draggedIndex === index
                    ? 'scale-95 opacity-50 shadow-lg'
                    : dragOverIndex === index && draggedIndex !== null
                      ? 'ring-opacity-50 ring-2 ring-blue-300 dark:ring-blue-600'
                      : 'hover:shadow-md'
                }`}
              >
                <div className="mb-2 flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    #{index + 1}
                  </span>
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
                      className={`w-24 rounded border bg-white px-2 py-1 text-center text-sm placeholder:text-gray-500 dark:bg-gray-700 dark:placeholder:text-gray-400 ${getInputValidationClass(op, 'value')}`}
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
                      className={`w-24 rounded border bg-white px-2 py-1 text-center text-sm placeholder:text-gray-500 dark:bg-gray-700 dark:placeholder:text-gray-400 ${getInputValidationClass(op, 'value')}`}
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

                  {/* Position Select for insert_position */}
                  {op.type === 'insert_position' && (
                    <Select
                      value={op.position || ''}
                      onValueChange={(value) => handleInputValidation(op, 'position', value)}
                    >
                      <SelectTrigger className={`w-32 ${getInputValidationClass(op, 'position')}`}>
                        <SelectValue placeholder="Select Position" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          {
                            length: Math.max(
                              1,
                              operations.filter((o) =>
                                ['insert_beginning', 'insert_end', 'insert_position'].includes(
                                  o.type,
                                ),
                              ).length + 1,
                            ),
                          },
                          (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              Position {i}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Position input for other operations that need it */}
                  {['delete_position', 'search_position', 'update_position'].includes(op.type) && (
                    <input
                      type="number"
                      placeholder="Position"
                      value={op.position || ''}
                      onChange={(e) => handleInputValidation(op, 'position', e.target.value)}
                      className={`w-24 rounded border bg-white px-2 py-1 text-center text-sm placeholder:text-gray-500 dark:bg-gray-700 dark:placeholder:text-gray-400 ${getInputValidationClass(op, 'position')}`}
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
                      className={`w-24 rounded border bg-white px-2 py-1 text-center text-sm placeholder:text-gray-500 dark:bg-gray-700 dark:placeholder:text-gray-400 ${getInputValidationClass(op, 'newValue')}`}
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
                      className={`w-24 rounded border bg-white px-2 py-1 text-center text-sm placeholder:text-gray-500 dark:bg-gray-700 dark:placeholder:text-gray-400 ${getInputValidationClass(op, 'value')}`}
                      step="1"
                    />
                  )}

                  {/* Source Stack Select for copyStack operation */}
                  {op.type === 'copyStack' && (
                    <Select
                      value={op.sourceStack || ''}
                      onValueChange={(value) => handleInputValidation(op, 'sourceStack', value)}
                    >
                      <SelectTrigger
                        className={`w-32 ${getInputValidationClass(op, 'sourceStack')}`}
                      >
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
                      <SelectTrigger
                        className={`w-32 ${getInputValidationClass(op, 'targetStack')}`}
                      >
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
                      <SelectTrigger
                        className={`w-32 ${getInputValidationClass(op, 'targetStack')}`}
                      >
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
                      <SelectTrigger
                        className={`w-32 ${getInputValidationClass(op, 'targetStack')}`}
                      >
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
                  <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                    {op.category === 'insertion' && 'Insertion'}
                    {op.category === 'deletion' && 'Deletion'}
                    {op.category === 'traversal' && 'Traversal'}
                    {op.category === 'searching' && 'Searching'}
                    {op.category === 'update' && 'Update'}
                    {op.category === 'utility' && 'Utility'}
                  </div>
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
