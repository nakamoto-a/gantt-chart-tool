import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from datetime import timedelta
from src.models.user import db, User
from src.models.project import Project
from src.models.task import Task
from src.routes.auth import auth_bp
from src.routes.user import user_bp
from src.routes.project import project_bp
from src.routes.task import task_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# セッション設定
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)  # 30日間有効

# CORS設定 - クッキーを含むリクエストを許可
CORS(app, supports_credentials=True, origins=['*'])

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(project_bp, url_prefix='/api')
app.register_blueprint(task_bp, url_prefix='/api')

# データベース設定 - 環境変数からDATABASE_URLを取得（Render用）
# ローカル環境ではSQLite、本番環境ではPostgreSQLを使用
database_url = os.environ.get('DATABASE_URL')
if database_url:
    # RenderのPostgreSQL URLは postgres:// で始まるが、SQLAlchemyは postgresql:// を要求
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # ローカル環境ではSQLiteを使用
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    
    # 管理者アカウントが存在しない場合は作成
    try:
        admin = User.query.filter_by(email='admin@gantt.local').first()
        if not admin:
            admin = User(
                last_name='管理者',
                first_name='太郎',
                email='admin@gantt.local',
                is_admin=True
            )
            admin.set_password('Admin@2024')
            db.session.add(admin)
            db.session.commit()
            print('管理者アカウントを作成しました')
    except Exception as e:
        db.session.rollback()
        print(f'管理者アカウント作成エラー: {e}')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

