import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Target, Edit, Plus } from 'lucide-react';
import './App.css';

const GanttChart = ({ project, projects, tasks, allTasks, onEditTask, onAddTask, onToggleTaskCompletion, showAllProjects = false }) => {
  const [viewMode, setViewMode] = useState('week'); // 'year', 'month', 'week', 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const chartRef = useRef(null);
  const headerRef = useRef(null);
  const bodyRef = useRef(null);

  // ヘッダーとボディのスクロール同期
  useEffect(() => {
    const bodyElement = bodyRef.current;
    const headerElement = headerRef.current;

    if (!bodyElement || !headerElement) return;

    let isBodyScrolling = false;
    let isHeaderScrolling = false;

    const handleBodyScroll = () => {
      if (isHeaderScrolling) return;
      isBodyScrolling = true;
      const scrollLeft = bodyElement.scrollLeft;
      headerElement.scrollLeft = scrollLeft;
      setTimeout(() => { isBodyScrolling = false; }, 10);
    };

    const handleHeaderScroll = () => {
      if (isBodyScrolling) return;
      isHeaderScrolling = true;
      const scrollLeft = headerElement.scrollLeft;
      bodyElement.scrollLeft = scrollLeft;
      setTimeout(() => { isHeaderScrolling = false; }, 10);
    };

    bodyElement.addEventListener('scroll', handleBodyScroll, { passive: true });
    headerElement.addEventListener('scroll', handleHeaderScroll, { passive: true });

    return () => {
      bodyElement.removeEventListener('scroll', handleBodyScroll);
      headerElement.removeEventListener('scroll', handleHeaderScroll);
    };
  }, []);

  // 本日位置への自動スクロール
  useEffect(() => {
    const bodyElement = bodyRef.current;
    if (!bodyElement) return;

    // 少し遅延させてレンダリング後にスクロール
    setTimeout(() => {
      const todayPosition = calculateTodayLinePosition();
      const scrollWidth = bodyElement.scrollWidth;
      const clientWidth = bodyElement.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      
      // 本日の位置を画面中央に表示
      const targetScroll = (scrollWidth * todayPosition / 100) - (clientWidth / 2);
      const finalScroll = Math.max(0, Math.min(maxScroll, targetScroll));
      
      bodyElement.scrollLeft = finalScroll;
    }, 100);
  }, [viewMode, customStartDate, customEndDate, tasks]);

  // 日付範囲を計算
  const getDateRange = () => {
    const today = new Date();
    let start, end, unit;

    // カスタム日付範囲が設定されている場合
    if (customStartDate && customEndDate) {
      start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      unit = 'day';
      return { start, end, unit };
    }

    switch (viewMode) {
      case 'year':
        // 5年間を表示（今年を中心に前後2年）
        start = new Date(today.getFullYear() - 2, 0, 1);
        end = new Date(today.getFullYear() + 2, 11, 31);
        unit = 'year';
        break;
      case 'month':
        // 6ヶ月を表示（今月を中心に前後数ヶ月）
        start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        end = new Date(today.getFullYear(), today.getMonth() + 4, 0); // 4ヶ月後の月末
        unit = 'month';
        break;
      case 'week':
        // 5週間を表示（今週を中心に前後2週）
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // 今週の日曜日
        start = new Date(startOfWeek);
        start.setDate(start.getDate() - 14); // 2週間前から
        end = new Date(startOfWeek);
        end.setDate(end.getDate() + 21); // 3週間後まで
        unit = 'week';
        break;
      case 'day':
        // 今日から過去2週間と未来2ヶ月分を表示
        start = new Date(today);
        start.setDate(today.getDate() - 14); // 2週間前から
        start.setHours(0, 0, 0, 0); // 日の開始時刻に設定
        
        // 2ヶ月後を正確に計算（日数で計算）
        end = new Date(today);
        end.setDate(today.getDate() + 60); // 約60日後（2ヶ月相当）
        end.setHours(23, 59, 59, 999); // 日の終了時刻に設定
        unit = 'day';
        break;
      default:
        start = new Date(today);
        end = new Date(today);
        unit = 'day';
    }

    return { start, end, unit };
  };

  // 時間軸のラベルを生成
  const generateTimeLabels = () => {
    const { start, end, unit } = getDateRange();
    const labels = [];
    const current = new Date(start);
    const today = new Date();

    while (current <= end) {
      switch (unit) {
        case 'year':
          const year = current.getFullYear();
          const isCurrentYear = year === today.getFullYear();
          labels.push({
            date: new Date(current),
            label: `${year}`,
            isToday: isCurrentYear
          });
          current.setFullYear(current.getFullYear() + 1);
          break;
        case 'month':
          const month = current.getMonth();
          const year_m = current.getFullYear();
          const isCurrentMonth = month === today.getMonth() && year_m === today.getFullYear();
          labels.push({
            date: new Date(current),
            label: `${year_m}/${month + 1}`,
            isToday: isCurrentMonth
          });
          current.setMonth(current.getMonth() + 1);
          break;
        case 'week':
          // 週の開始日（日曜日）を表示
          const weekStart = new Date(current);
          weekStart.setDate(current.getDate() - current.getDay());
          const isCurrentWeek = 
            today >= weekStart && 
            today < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          labels.push({
            date: new Date(weekStart),
            label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
            isToday: isCurrentWeek
          });
          current.setDate(current.getDate() + 7);
          break;
        case 'day':
          const isToday = current.toDateString() === today.toDateString();
          labels.push({
            date: new Date(current),
            label: `${current.getMonth() + 1}/${current.getDate()}`,
            isToday
          });
          current.setDate(current.getDate() + 1);
          break;
      }
    }

    return labels;
  };

  // タスクの位置とサイズを計算
  const calculateTaskPosition = (task) => {
    const { start: rangeStart, end: rangeEnd } = getDateRange();
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);

    const totalDuration = rangeEnd.getTime() - rangeStart.getTime();
    const taskStartOffset = taskStart.getTime() - rangeStart.getTime();
    const taskDuration = taskEnd.getTime() - taskStart.getTime();

    const left = Math.max(0, (taskStartOffset / totalDuration) * 100);
    let width = Math.min(100 - left, (taskDuration / totalDuration) * 100);
    
    // 最小幅を設定（視認性を確保）
    const minWidth = 0.5; // 0.5%の最小幅
    width = Math.max(width, minWidth);

    return { left: `${left}%`, width: `${width}%` };
  };

  // 本日ラインの位置を計算
  const calculateTodayLinePosition = () => {
    const { start: rangeStart, end: rangeEnd } = getDateRange();
    const today = new Date();
    
    // 全ての表示モードで今日の0時を使用
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayTime = todayStart.getTime();
    
    const totalDuration = rangeEnd.getTime() - rangeStart.getTime();
    const todayOffset = todayTime - rangeStart.getTime();
    
    const position = (todayOffset / totalDuration) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const timeLabels = generateTimeLabels();
  const todayLinePosition = calculateTodayLinePosition();

  // 表示するタスクとプロジェクトを決定
  const displayData = showAllProjects 
    ? projects?.map(proj => ({
        project: proj,
        tasks: allTasks?.filter(task => task.project_id === proj.id) || []
      })) || []
    : [{ project, tasks: tasks || [] }];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {showAllProjects ? '全プロジェクト' : (project?.name || 'プロジェクト')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('year')}
            >
              年
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              月
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              週
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              日
            </Button>
            <Button
              variant={customStartDate && customEndDate ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDateRangePicker(!showDateRangePicker)}
              className="ml-2"
            >
              <Calendar className="h-4 w-4 mr-1" />
              範囲指定
            </Button>
            {(customStartDate || customEndDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCustomStartDate(null);
                  setCustomEndDate(null);
                }}
              >
                リセット
              </Button>
            )}
            {!showAllProjects && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddTask}
                className="ml-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                タスク追加
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {showDateRangePicker && (
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">開始日:</label>
              <input
                type="date"
                value={customStartDate || ''}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">終了日:</label>
              <input
                type="date"
                value={customEndDate || ''}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              />
            </div>
            <Button
              size="sm"
              onClick={() => {
                if (customStartDate && customEndDate) {
                  setShowDateRangePicker(false);
                }
              }}
              disabled={!customStartDate || !customEndDate}
            >
              適用
            </Button>
          </div>
        </div>
      )}
      <CardContent>
        <div className="gantt-container" ref={chartRef}>
          {/* 時間軸ヘッダー */}
          <div className="gantt-header" ref={headerRef}>
            <div className="gantt-task-column">
              <div className="font-semibold text-sm">タスク</div>
            </div>
            <div className="gantt-timeline-header" style={{ minWidth: `${timeLabels.length * 80}px` }}>
              {timeLabels.map((label, index) => (
                <div
                  key={index}
                  className={`gantt-time-label ${label.isToday ? 'today' : ''}`}
                >
                  {label.label}
                </div>
              ))}
            </div>
          </div>

          {/* タスク行 */}
          <div className="gantt-body" ref={bodyRef} style={{ scrollbarWidth: 'thin' }}>
            {displayData.length > 0 ? (
              displayData.map((data, projectIndex) => (
                <div key={data.project?.id || projectIndex}>
                  {/* プロジェクト名（全プロジェクト表示時のみ） */}
                  {showAllProjects && (
                    <div className="gantt-project-header">
                      <div className="gantt-task-info">
                        <div className="font-bold text-base text-blue-600 py-2">
                          {data.project?.name || 'プロジェクト'}
                        </div>
                      </div>
                      <div className="gantt-timeline" style={{ minWidth: `${timeLabels.length * 80}px` }}>
                        <div 
                          className="gantt-today-line" 
                          style={{ left: `${todayLinePosition}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* タスク行 */}
                  {data.tasks && data.tasks.length > 0 ? (
                    data.tasks.map((task) => {
                      const position = calculateTaskPosition(task);
                      return (
                        <div key={task.id} className={`gantt-row ${task.is_completed ? 'completed' : ''}`}>
                          <div className="gantt-task-info">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={task.is_completed || false}
                                onCheckedChange={(checked) => onToggleTaskCompletion(task.id, checked)}
                                className="h-4 w-4"
                              />
                              <span className={`font-medium text-sm ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                                {task.name}
                              </span>
                              {task.is_milestone && (
                                <Badge variant="secondary" className="text-xs">
                                  <Target className="h-3 w-3 mr-1" />
                                  マイルストーン
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditTask(task)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              進捗: {task.progress}%
                              {task.assignees && task.assignees.length > 0 && (
                                <span className="ml-2">
                                  担当: {task.assignees.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="gantt-timeline" style={{ minWidth: `${timeLabels.length * 80}px` }}>
                            {/* 本日ライン */}
                            {!showAllProjects && (
                              <div 
                                className="gantt-today-line" 
                                style={{ left: `${todayLinePosition}%` }}
                              />
                            )}
                            
                            {/* タスクバー */}
                            <div
                              className={`gantt-task-bar ${task.is_milestone ? 'milestone' : ''} ${task.is_completed ? 'completed' : ''}`}
                              style={position}
                            >
                              <div className="gantt-task-progress" style={{ width: `${task.progress}%` }} />
                              <div className="gantt-task-content">
                                <span className="text-xs font-medium text-white">
                                  {task.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="gantt-row">
                      <div className="gantt-task-info">
                        <span className="text-gray-500 text-sm ml-4">タスクがありません</span>
                      </div>
                      <div className="gantt-timeline" style={{ minWidth: `${timeLabels.length * 80}px` }}>
                        {!showAllProjects && (
                          <div 
                            className="gantt-today-line" 
                            style={{ left: `${todayLinePosition}%` }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="gantt-row">
                <div className="gantt-task-info">
                  <span className="text-gray-500 text-sm">プロジェクトがありません</span>
                </div>
                <div className="gantt-timeline" style={{ minWidth: `${timeLabels.length * 80}px` }}>
                  <div 
                    className="gantt-today-line" 
                    style={{ left: `${todayLinePosition}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;

