'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { RequestApprovalDialogProps } from '@/types';
import { LAB_ROOMS, TABLE_NUMBERS } from '@/lib/constants/queue';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RequestApprovalDialog: React.FC<RequestApprovalDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    lab_room: '',
    table_number: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.lab_room.trim()) {
      newErrors.lab_room = 'กรุณาเลือกห้อง Lab';
    }

    if (!formData.table_number.trim()) {
      newErrors.table_number = 'กรุณาเลือกหมายเลขโต๊ะ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        lab_room: formData.lab_room,
        table_number: formData.table_number,
        notes: formData.notes.trim() || undefined,
      });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ lab_room: '', table_number: '', notes: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>เรียกผู้สอนตรวจสอบ</AlertDialogTitle>
          <AlertDialogDescription>
            กรุณากรอกข้อมูลห้อง Lab และหมายเลขโต๊ะเพื่อส่งคำขอตรวจสอบ
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Lab Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="lab_room" className="text-sm font-medium">
              ห้อง Lab <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.lab_room}
              onValueChange={(value) => handleInputChange('lab_room', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.lab_room ? 'border-red-500' : ''}>
                <SelectValue placeholder="เลือกห้อง Lab" />
              </SelectTrigger>
              <SelectContent>
                {LAB_ROOMS.map((room) => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lab_room && <p className="text-sm text-red-500">{errors.lab_room}</p>}
          </div>

          {/* Table Number Selection */}
          <div className="space-y-2">
            <Label htmlFor="table_number" className="text-sm font-medium">
              หมายเลขโต๊ะ <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.table_number}
              onValueChange={(value) => handleInputChange('table_number', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.table_number ? 'border-red-500' : ''}>
                <SelectValue placeholder="เลือกหมายเลขโต๊ะ" />
              </SelectTrigger>
              <SelectContent>
                {TABLE_NUMBERS.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.table_number && <p className="text-sm text-red-500">{errors.table_number}</p>}
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              หมายเหตุ (ไม่บังคับ)
            </Label>
            <Textarea
              id="notes"
              placeholder="เพิ่มหมายเหตุหรือข้อมูลเพิ่มเติม..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={isLoading}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              'ส่งคำขอ'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RequestApprovalDialog;
