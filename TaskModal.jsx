import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Target, FileText, Percent, Users, X, Plus } from 'lucide-react';
import '../App.css';

const TaskModal = ({ isOpen, onClose, task, onSave, projectId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    progress: 0,
    is_milestone: false,
    assignees: [],
    memo: ''
  });

  const [errors, setErrors] = useState({});
  const [newAssignee, setNewAssignee] = useState('');

  // 担当者を追加
  const addAssignee = () => {
    if (newAssignee.trim() && !formData.assignees.includes(newAssignee.trim())) {
      setFormData(prev => ({
        ...prev,
        assignees: [...prev.assignees, newAssignee.trim()]
      }));
      setNewAssignee('');
    }
  };

  // 担当者を削除
  const removeAssignee = (assigneeToRemove) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(assignee => assignee !== assigneeToRemove)
    }));
  };

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        start_date: task.start_date || '',
        end_date: task.end_date || '',
        progress: task.progress || 0,
        is_milestone: task.is_milestone || false,
        assignees: task.assignees || [],
        memo: task.memo || ''
      });
    } else {
      // 新規タスクの場合、デフォルト値を設定
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        name: '',
        description: '',
        start_date: today.toISOString().split('T')[0],
        end_date: tomorrow.toISOString().split('T')[0],
        progress: 0,
        is_milestone: false,
        assignees: [],
        memo: ''
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'タスク名は必須です';
    }

    if (!formData.start_date) {
      newErrors.start_date = '開始日は必須です';
    }

    if (!formData.end_date) {
      newErrors.end_date = '終了日は必須です';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (startDate > endDate) {
        newErrors.end_date = '終了日は開始日より後である必要があります';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const taskData = {
      ...formData,
      project_id: projectId
    };

    onSave(taskData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      progress: 0,
      is_milestone: false,
      assignees: [],
      memo: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {task ? 'タスクを編集' : '新しいタスクを作成'}
          </DialogTitle>
          <DialogDescription>
            タスクの詳細情報を入力してください。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* タスク名 */}
          <div className="grid gap-2">
            <Label htmlFor="name">タスク名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="タスク名を入力"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name}</span>
            )}
          </div>

          {/* 説明 */}
          <div className="grid gap-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="タスクの説明を入力"
              rows={3}
            />
          </div>

          {/* 日付 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_date">開始日 *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <span className="text-sm text-red-500">{errors.start_date}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">終了日 *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <span className="text-sm text-red-500">{errors.end_date}</span>
              )}
            </div>
          </div>

          {/* 進捗率 */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              進捗率: {formData.progress}%
            </Label>
            <Slider
              value={[formData.progress]}
              onValueChange={(value) => handleInputChange('progress', value[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* 担当者 */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              担当者
            </Label>
            <div className="flex gap-2">
              <Input
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                placeholder="担当者名を入力"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAssignee();
                  }
                }}
              />
              <Button type="button" onClick={addAssignee} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.assignees.map((assignee, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                  >
                    <span>{assignee}</span>
                    <button
                      type="button"
                      onClick={() => removeAssignee(assignee)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* マイルストーン */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_milestone"
              checked={formData.is_milestone}
              onCheckedChange={(checked) => handleInputChange('is_milestone', checked)}
            />
            <Label htmlFor="is_milestone" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              マイルストーンとして設定
            </Label>
          </div>

          {/* メモ */}
          <div className="grid gap-2">
            <Label htmlFor="memo" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              メモ
            </Label>
            <Textarea
              id="memo"
              value={formData.memo}
              onChange={(e) => handleInputChange('memo', e.target.value)}
              placeholder="メモや補足情報を入力"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>
            {task ? '更新' : '作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;

