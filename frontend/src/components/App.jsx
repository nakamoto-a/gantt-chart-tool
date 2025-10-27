import { useState, useEffect } from 'react';
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
  Globe,
  LogOut,
  Shield
} from 'lucide-react';
import GanttChart from './GanttChart';
import TaskModal from './TaskModal';
import ProjectModal from './ProjectModal';
import Login from './Login';
import AdminPanel from './AdminPanel';
import ApiService from '../lib/api';
import './App.css';

function App() {
  // 認証状態
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [projects, setProjects] = useState([]);
  const [personalProjects, setPersonalProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [viewMode, setViewMode] = useState('shared'); // 'shared' or 'personal'

  // モーダル状態
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // 認証状態チェック
  useEffect(() => {
    checkAuth();
  }, []);

  // 認証後にプロジェクトを読み込み
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
      loadPersonalProjects();
    }
  }, [isAuthenticated]);

  // 選択されたプロジェクトのタスクを読み込み
  useEffect(() => {
    if (selectedProject && !showAllProjects && isAuthenticated) {
      loadTasks(selectedProject.id);
    }
  }, [selectedProject, showAllProjects, isAuthenticated]);

  // 全プロジェクト表示時に全タスクを読み込み
  useEffect(() => {
    if (showAllProjects && isAuthenticated) {
      loadAllTasks();
    }
  }, [showAllProjects, projects, isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.authenticated) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('認証チェックエラー:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setCurrentUser(null);
      setIsAuthenticated(false);
      setProjects([]);
      setTasks([]);
      setAllTasks([]);
      setSelectedProject(null);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await ApiService.getProjects();
      setProjects(projectsData);
      
      // 最初のプロジェクトを自動選択（共有モードで全プロジェクト表示でない場合）
      if (viewMode === 'shared' && projectsData.length > 0 && !selectedProject && !showAllProjects) {
        setSelectedProject(projectsData[0]);
      }
    } catch (err) {
      setError('プロジェクトの読み込みに失敗しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalProjects = async () => {
    try {
      const projectsData = await ApiService.getPersonalProjects();
      setPersonalProjects(projectsData);
      
      // 最初のマイプロジェクトを自動選択（個人モードで全プロジェクト表示でない場合）
      if (viewMode === 'personal' && projectsData.length > 0 && !selectedProject && !showAllProjects) {
        setSelectedProject(projectsData[0]);
      }
    } catch (err) {
      console.error('マイプロジェクトの読み込みに失敗しました:', err);
    }
  };

  const loadTasks = async (projectId) => {
    try {
      setError(null);
      const tasksData = await ApiService.getTasks(projectId);
      setTasks(tasksData);
    } catch (err) {
      console.error(`プロジェクト ${projectId} のタスク読み込みエラー:`, err);
      setTasks([]);
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
      setError('全タスクの読み込みに失敗しました');
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setShowAllProjects(false);
  };

  const handleShowAllProjects = () => {
    setShowAllProjects(true);
    setSelectedProject(null);
  };

  const handleSwitchToShared = () => {
    setViewMode('shared');
    setShowAllProjects(false);
    setSelectedProject(projects.length > 0 ? projects[0] : null);
  };

  const handleSwitchToPersonal = () => {
    setViewMode('personal');
    setShowAllProjects(false);
    setSelectedProject(personalProjects.length > 0 ? personalProjects[0] : null);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('このプロジェクトを削除してもよろしいですか？\nプロジェクトに紐づくタスクも全て削除されます。')) {
      return;
    }

    try {
      // 選択状態を先にクリア
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setTasks([]);
      }
      
      await ApiService.deleteProject(projectId);
      await loadProjects();
    } catch (err) {
      console.error('プロジェクト削除エラー:', err);
      // 削除は成功している可能性があるのでプロジェクトを再読み込み
      await loadProjects();
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await ApiService.updateProject(editingProject.id, projectData);
      } else {
        // プロジェクト作成時にis_personalフラグを追加
        const dataWithMode = {
          ...projectData,
          is_personal: viewMode === 'personal'
        };
        await ApiService.createProject(dataWithMode);
      }
      await loadProjects();
      await loadPersonalProjects();
      setIsProjectModalOpen(false);
    } catch (err) {
      alert('プロジェクトの保存に失敗しました: ' + err.message);
    }
  };

  const handleAddTask = () => {
    if (!selectedProject && !showAllProjects) {
      alert('プロジェクトを選択してください');
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
      const projectId = editingTask?.project_id || selectedProject?.id;
      
      if (!projectId) {
        alert('プロジェクトが選択されていません');
        return;
      }

      if (editingTask) {
        await ApiService.updateTask(editingTask.id, taskData);
      } else {
        await ApiService.createTask(projectId, taskData);
      }

      if (showAllProjects) {
        await loadAllTasks();
      } else if (selectedProject) {
        await loadTasks(selectedProject.id);
      }
      
      setIsTaskModalOpen(false);
    } catch (err) {
      alert('タスクの保存に失敗しました: ' + err.message);
    }
  };

  const handleToggleTaskCompletion = async (taskId, isCompleted) => {
    try {
      await ApiService.updateTask(taskId, { is_completed: isCompleted });
      
      if (showAllProjects) {
        await loadAllTasks();
      } else if (selectedProject) {
        await loadTasks(selectedProject.id);
      }
    } catch (err) {
      alert('タスクの更新に失敗しました: ' + err.message);
    }
  };

  // 認証チェック中
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合はログイン画面を表示
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ガントチャートツール</h1>
                <p className="text-sm text-gray-500">プロジェクトとタスクを効率的に管理しましょう</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.full_name}
                  {currentUser?.is_admin && (
                    <Badge variant="default" className="ml-2 text-xs">管理者</Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500">{currentUser?.email}</div>
              </div>
              {currentUser?.is_admin && (
                <Button
                  onClick={() => setShowAdminPanel(true)}
                  variant="outline"
                  size="sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  管理者画面
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-88px)]">
        {/* サイドバー */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">プロジェクト</CardTitle>
                </div>
                <Button onClick={handleAddProject} size="sm" className="h-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* 表示モード切り替え */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'shared' ? "default" : "outline"}
                    className="flex-1"
                    size="sm"
                    onClick={handleSwitchToShared}
                  >
                    共有
                  </Button>
                  <Button
                    variant={viewMode === 'personal' ? "default" : "outline"}
                    className="flex-1"
                    size="sm"
                    onClick={handleSwitchToPersonal}
                  >
                    マイ
                  </Button>
                </div>
                <Separator />
                <Button
                  variant={showAllProjects ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={handleShowAllProjects}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  全プロジェクト表示
                </Button>
                <Separator />
                {/* プロジェクト一覧 */}
                {viewMode === 'shared' ? (
                  projects.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      共有プロジェクトがありません
                    </p>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedProject?.id === project.id && !showAllProjects
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{project.name}</h3>
                          <p className="text-xs text-gray-500">
                            {project.tasks?.length || 0} 未完了
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  personalProjects.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      マイプロジェクトがありません
                    </p>
                  ) : (
                    personalProjects.map((project) => (
                      <div
                        key={project.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedProject?.id === project.id && !showAllProjects
                            ? 'bg-green-50 border-2 border-green-200'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{project.name}</h3>
                          <p className="text-xs text-gray-500">
                            {project.tasks?.length || 0} 未完了
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p>{error}</p>
              </div>
            </div>
          ) : !selectedProject && !showAllProjects ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  プロジェクトを選択してください
                </h2>
                <p className="text-gray-500 mb-4">
                  左側からプロジェクトを選択するか、新しいプロジェクトを作成してください
                </p>
                <Button onClick={handleAddProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  プロジェクトを作成
                </Button>
              </div>
            </div>
          ) : (
            <GanttChart
              project={selectedProject}
              projects={projects}
              tasks={showAllProjects ? [] : tasks}
              allTasks={showAllProjects ? allTasks : []}
              onEditTask={handleEditTask}
              onAddTask={handleAddTask}
              onToggleTaskCompletion={handleToggleTaskCompletion}
              showAllProjects={showAllProjects}
            />
          )}
        </main>
      </div>

      {/* モーダル */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={editingProject}
        onSave={handleSaveProject}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        projectId={selectedProject?.id}
        project={selectedProject}
      />

      {/* 管理者画面 */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}

export default App;

