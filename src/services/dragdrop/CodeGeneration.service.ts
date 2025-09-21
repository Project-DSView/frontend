import { SinglyLinkedListOperation, DoublyLinkedListOperation } from '@/types';
import { singlyLinkedListCodeTemplate, doublyLinkedListCodeTemplate } from '@/data';

class CodeGenerationService {
  static generateSinglyLinkedListCode(operations: SinglyLinkedListOperation[]): string {
    let code = singlyLinkedListCodeTemplate;

    operations.forEach((op) => {
      if (op.type === 'insert_beginning' && op.value !== '') {
        code += `ll.insert_at_beginning(${op.value})  # Insert ${op.value} at beginning\n`;
      } else if (op.type === 'insert_end' && op.value !== '') {
        code += `ll.insert_at_end(${op.value})  # Insert ${op.value} at end\n`;
      } else if (op.type === 'insert_position' && op.value !== '' && op.position !== '') {
        code += `ll.insert_at_position(${op.value}, ${op.position})  # Insert ${op.value} at position ${op.position}\n`;
      } else if (op.type === 'delete_beginning') {
        code += `ll.delete_from_beginning()  # Delete from beginning\n`;
      } else if (op.type === 'delete_end') {
        code += `ll.delete_at_end()  # Delete from end\n`;
      } else if (op.type === 'delete_value' && op.value !== '') {
        code += `ll.delete_by_value(${op.value})  # Delete value ${op.value}\n`;
      } else if (op.type === 'delete_position' && op.position !== '') {
        code += `ll.delete_at_position(${op.position})  # Delete at position ${op.position}\n`;
      } else if (op.type === 'traverse') {
        code += `print("Current list:", ll.traverse())  # Traverse\n`;
      } else if (op.type === 'search_value' && op.value !== '') {
        code += `print("Position of ${op.value}:", ll.search_by_value(${op.value}))  # Search by value\n`;
      } else if (op.type === 'search_position' && op.position !== '') {
        code += `print("Value at position ${op.position}:", ll.search_by_position(${op.position}))  # Search by position\n`;
      } else if (op.type === 'update_value' && op.value !== '' && op.newValue !== '') {
        code += `ll.update_by_value(${op.value}, ${op.newValue})  # Update value ${op.value} to ${op.newValue}\n`;
      } else if (op.type === 'update_position' && op.position !== '' && op.newValue !== '') {
        code += `ll.update_by_position(${op.position}, ${op.newValue})  # Update position ${op.position} to ${op.newValue}\n`;
      }
    });

    return code;
  }

  static generateDoublyLinkedListCode(operations: DoublyLinkedListOperation[]): string {
    let code = doublyLinkedListCodeTemplate;

    operations.forEach((op) => {
      if (op.type === 'insert_beginning' && op.value !== '') {
        code += `dll.insert_at_beginning(${op.value})  # Insert ${op.value} at beginning\n`;
      } else if (op.type === 'insert_end' && op.value !== '') {
        code += `dll.insert_at_end(${op.value})  # Insert ${op.value} at end\n`;
      } else if (op.type === 'insert_position' && op.value !== '' && op.position !== '') {
        code += `dll.insert_at_position(${op.value}, ${op.position})  # Insert ${op.value} at position ${op.position}\n`;
      } else if (op.type === 'insert_before_position' && op.value !== '' && op.position !== '') {
        code += `dll.insert_before_position(${op.value}, ${op.position})  # Insert ${op.value} before position ${op.position}\n`;
      } else if (op.type === 'delete_beginning') {
        code += `dll.delete_from_beginning()  # Delete from beginning\n`;
      } else if (op.type === 'delete_end') {
        code += `dll.delete_from_end()  # Delete from end\n`;
      } else if (op.type === 'delete_value' && op.value !== '') {
        code += `dll.delete_by_value(${op.value})  # Delete value ${op.value}\n`;
      } else if (op.type === 'delete_position' && op.position !== '') {
        code += `dll.delete_at_position(${op.position})  # Delete at position ${op.position}\n`;
      } else if (op.type === 'delete_before_position' && op.position !== '') {
        code += `dll.delete_before_position(${op.position})  # Delete before position ${op.position}\n`;
      } else if (op.type === 'traverse_forward') {
        code += `print("Forward traversal:", dll.traverse_forward())  # Traverse forward\n`;
      } else if (op.type === 'traverse_backward') {
        code += `print("Backward traversal:", dll.traverse_backward())  # Traverse backward\n`;
      } else if (op.type === 'search_value' && op.value !== '') {
        code += `print("Position of ${op.value}:", dll.search_by_value(${op.value}))  # Search by value\n`;
      } else if (op.type === 'search_position' && op.position !== '') {
        code += `print("Value at position ${op.position}:", dll.search_by_position(${op.position}))  # Search by position\n`;
      } else if (op.type === 'update_value' && op.value !== '' && op.newValue !== '') {
        code += `dll.update_by_value(${op.value}, ${op.newValue})  # Update value ${op.value} to ${op.newValue}\n`;
      } else if (op.type === 'update_position' && op.position !== '' && op.newValue !== '') {
        code += `dll.update_by_position(${op.position}, ${op.newValue})  # Update position ${op.position} to ${op.newValue}\n`;
      }
    });

    return code;
  }

  static generateCodeForDataStructure(
    dataStructureType: string,
    operations: SinglyLinkedListOperation[],
  ): string {
    switch (dataStructureType) {
      case 'singly-linked-list':
        return this.generateSinglyLinkedListCode(operations);
      case 'doubly-linked-list':
        return this.generateDoublyLinkedListCode(operations as DoublyLinkedListOperation[]);
      case 'stack':
        // TODO: Implement for stack
        return '// Stack code generation not implemented yet';
      case 'binary-search-tree':
        // TODO: Implement for binary search tree
        return '// Binary Search Tree code generation not implemented yet';
      case 'graph':
        // TODO: Implement for graph
        return '// Graph code generation not implemented yet';
      default:
        return '// Unknown data structure type';
    }
  }

  static getCodeTemplate(dataStructureType: string): string {
    switch (dataStructureType) {
      case 'singly-linked-list':
        return singlyLinkedListCodeTemplate;
      case 'doubly-linked-list':
        return doublyLinkedListCodeTemplate;
      case 'stack':
        // TODO: Return stack template
        return '// Stack template not implemented yet';
      case 'binary-search-tree':
        // TODO: Return binary search tree template
        return '// Binary Search Tree template not implemented yet';
      case 'graph':
        // TODO: Return graph template
        return '// Graph template not implemented yet';
      default:
        return '// Unknown data structure type';
    }
  }
}

export { CodeGenerationService };
