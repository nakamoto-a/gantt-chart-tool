import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Target, FileText, Percent, Users, X, Plus } from 'lucide-react';
import './App.css';

const TaskModal = ({ isOpen, onClose, task, onSave, projectId, project }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    progress: 0,
    is_milestone: false,
    assignee_ids: [],
    memo: ''
  });

  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // ユーザー一覧を取得
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('ユーザー読み込みエラー:', error);
    }
  };

  // 担当者を追加
  const addAssignee = () => {
    if (selectedUserId && !formData.assignee_ids.includes(parseInt(selectedUserId))) {
      setFormData(prev => ({
        ...prev,
        assignee_ids: [...prev.assignee_ids, parseInt(selectedUserId)]
      }));
      setSelectedUserId('');
    }
  };

  // 担当者を削除
  const removeAssignee = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignee_ids: prev.assignee_ids.filter(id => id !== userId)
    }));
  };

  // 担当者IDから担当者名を取得
  const getAssigneeName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name : '不明';
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
        assignee_ids: task.assignee_ids || [],
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
        assignee_ids: [],
        memo: ''
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'タスク名を入力してください';
    }

    if (!formData.start_date) {
      newErrors.start_date = '開始日を選択してください';
    }

    if (!formData.end_date) {
      newErrors.end_date = '終了日を選択してください';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = '終了日は開始日以降の日付を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      progress: 0,
      is_milestone: false,
      assignee_ids: [],
      memo: ''
    });
    setErrors({});
    setSelectedUserId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            {task ? 'タスクを編集' : '新しいタスクを作成'}
          </DialogTitle>
          <DialogDescription>
            タスクの詳細情報を入力してください。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* タスク名 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              タスク名 *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="タスク名を入力"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="タスクの説明を入力"
              rows={3}
            />
          </div>

          {/* 日付 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                開始日 *
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                終了日 *
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
            </div>
          </div>

          {/* 進捗率 */}
          <div className="space-y-2">
            <Label htmlFor="progress" className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              進捗率: {formData.progress}%
            </Label>
            <Slider
              id="progress"
              value={[formData.progress]}
              onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* 担当者（共有プロジェクトのみ表示） */}
          {!project?.is_personal && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                担当者
              </Label>
              <div className="flex gap-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="担当者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={addAssignee}
                  disabled={!selectedUserId}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.assignee_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.assignee_ids.map((userId) => (
                    <div
                      key={userId}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {getAssigneeName(userId)}
                      <button
                        type="button"
                        onClick={() => removeAssignee(userId)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* マイルストーン */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_milestone"
              checked={formData.is_milestone}
              onCheckedChange={(checked) => setFormData({ ...formData, is_milestone: checked })}
            />
            <Label htmlFor="is_milestone" className="cursor-pointer">
              マイルストーンとして設定
            </Label>
          </div>

          {/* メモ */}
          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Textarea
              id="memo"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="メモや補足情報を入力"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit">
              {task ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;

