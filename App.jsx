import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  BarChart3,
  Users,
  Clock,
  Globe
} from 'lucide-react';
import GanttChart from './components/GanttChart';
import TaskModal from './components/TaskModal';
import ProjectModal from './components/ProjectModal';
import ApiService from './services/api';
import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // モーダル状態
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // 初期データ読み込み
  useEffect(() => {
    loadProjects();
  }, []);

  // 選択されたプロジェクトのタスクを読み込み
  useEffect(() => {
    if (selectedProject && !showAllProjects) {
      loadTasks(selectedProject.id);
    }
  }, [selectedProject, showAllProjects]);

  // 全プロジェクト表示時に全タスクを読み込み
  useEffect(() => {
    if (showAllProjects) {
      loadAllTasks();
    }
  }, [showAllProjects, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await ApiService.getProjects();
      setProjects(projectsData);
      
      // 最初のプロジェクトを自動選択（全プロジェクト表示でない場合）
      if (projectsData.length > 0 && !selectedProject && !showAllProjects) {
        setSelectedProject(projectsData[0]);
      }
    } catch (err) {
      setError('プロジェクトの読み込みに失敗しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (projectId) => {
    try {
      setError(null); // エラーをクリア
      const tasksData = await ApiService.getTasks(projectId);
      setTasks(tasksData);
    } catch (err) {
      console.error(`プロジェクト ${projectId} のタスク読み込みエラー:`, err);
      setTasks([]); // エラー時は空配列を設定
      setError('タスクの読み込みに失敗しました: ' + err.message);
    }
  };

  const loadAllTasks = async () => {
    try {
      const allTasksPromises = projects.map(async (project) => {
        try {
          return await ApiService.getTasks(project.id);
        } catch (err) {
          console.warn(`プロジェクト ${project.id} のタスク読み込みに失敗:`, err);
          return [];
        }
      });
      const allTasksArrays = await Promise.all(allTasksPromises);
      const flatAllTasks = allTasksArrays.flat();
      setAllTasks(flatAllTasks);
    } catch (err) {
      console.error('全タスクの読み込みでエラー:', err);
      setError('一部のタスクの読み込みに失敗しました: ' + err.message);
    }
  };

  // プロジェクト関連の処理
  const handleCreateProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        const updatedProject = await ApiService.updateProject(editingProject.id, projectData);
        setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
        if (selectedProject && selectedProject.id === editingProject.id) {
          setSelectedProject(updatedProject);
        }
      } else {
        const newProject = await ApiService.createProject(projectData);
        setProjects([...projects, newProject]);
        if (!selectedProject && !showAllProjects) {
          setSelectedProject(newProject);
        }
      }
      setIsProjectModalOpen(false);
      setEditingProject(null);
      // プロジェクト一覧を再読み込みしてタスク数を更新
      loadProjects();
    } catch (err) {
      setError('プロジェクトの保存に失敗しました: ' + err.message);
    }
  };

  const handleDeleteProject = async (project) => {
    if (!confirm(`プロジェクト「${project.name}」を削除しますか？`)) {
      return;
    }

    try {
      await ApiService.deleteProject(project.id);
      const updatedProjects = projects.filter(p => p.id !== project.id);
      setProjects(updatedProjects);
      
      if (selectedProject && selectedProject.id === project.id) {
        setSelectedProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
      }
    } catch (err) {
      setError('プロジェクトの削除に失敗しました: ' + err.message);
    }
  };

  // タスク関連の処理
  const handleCreateTask = () => {
    if (!selectedProject) {
      setError('プロジェクトを選択してください');
      return;
    }
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const updatedTask = await ApiService.updateTask(editingTask.id, taskData);
        setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
        // 全タスクリストも更新
        setAllTasks(allTasks.map(t => t.id === editingTask.id ? updatedTask : t));
      } else {
        const newTask = await ApiService.createTask(selectedProject.id, taskData);
        setTasks([...tasks, newTask]);
        setAllTasks([...allTasks, newTask]);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      // プロジェクト一覧を再読み込みしてタスク数を更新
      loadProjects();
    } catch (err) {
      setError('タスクの保存に失敗しました: ' + err.message);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!confirm(`タスク「${task.name}」を削除しますか？`)) {
      return;
    }

    try {
      await ApiService.deleteTask(task.id);
      setTasks(tasks.filter(t => t.id !== task.id));
      setAllTasks(allTasks.filter(t => t.id !== task.id));
      // プロジェクト一覧を再読み込みしてタスク数を更新
      loadProjects();
    } catch (err) {
      setError('タスクの削除に失敗しました: ' + err.message);
    }
  };

  // タスク完了状態の切り替え
  const handleToggleTaskCompletion = async (taskId, isCompleted) => {
    try {
      const updatedTask = await ApiService.toggleTaskCompletion(taskId, isCompleted);
      
      // タスクリストを更新
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      setAllTasks(allTasks.map(t => t.id === taskId ? updatedTask : t));
      
      // プロジェクト一覧を再読み込みしてタスク数を更新
      loadProjects();
    } catch (err) {
      setError('タスクの完了状態の更新に失敗しました: ' + err.message);
    }
  };

  // 全プロジェクト表示の切り替え
  const handleToggleAllProjects = () => {
    setError(null); // エラーをクリア
    setShowAllProjects(!showAllProjects);
    if (!showAllProjects) {
      setSelectedProject(null);
      setTasks([]); // タスクをクリア
    } else if (projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            ガントチャートツール
          </h1>
          <p className="text-gray-600">プロジェクトとタスクを効率的に管理しましょう</p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError(null)}
              className="mt-2"
            >
              閉じる
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* サイドバー - プロジェクト一覧 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    プロジェクト
                  </CardTitle>
                  <Button size="sm" onClick={handleCreateProject}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* 全プロジェクト表示オプション */}
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      showAllProjects
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={handleToggleAllProjects}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">全プロジェクト表示</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      すべてのプロジェクトを比較表示
                    </p>
                  </div>

                  <Separator />

                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedProject && selectedProject.id === project.id && !showAllProjects
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedProject(project);
                          setShowAllProjects(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {project.name}
                            </h3>
                            {project.description && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {project.incomplete_tasks_count || 0} 未完了
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project);
                              }}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      プロジェクトがありません
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* メインコンテンツ - ガントチャート */}
          <div className="lg:col-span-3">
            {showAllProjects || selectedProject ? (
              <GanttChart
                project={selectedProject}
                projects={projects}
                tasks={tasks}
                allTasks={allTasks}
                onEditTask={handleEditTask}
                onAddTask={handleCreateTask}
                onToggleTaskCompletion={handleToggleTaskCompletion}
                showAllProjects={showAllProjects}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      プロジェクトを選択してください
                    </h3>
                    <p className="text-gray-500 mb-4">
                      左側からプロジェクトを選択するか、新しいプロジェクトを作成してください
                    </p>
                    <Button onClick={handleCreateProject}>
                      <Plus className="h-4 w-4 mr-2" />
                      プロジェクトを作成
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* モーダル */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
          project={editingProject}
          onSave={handleSaveProject}
        />

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
          onSave={handleSaveTask}
          projectId={selectedProject?.id}
        />
      </div>
    </div>
  );
}

export default App;
