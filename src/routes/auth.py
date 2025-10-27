from flask import Blueprint, request, jsonify, session
from src.models.user import db, User
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def login_required(f):
    """ログインが必要なエンドポイントのデコレータ"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'ログインが必要です'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """管理者権限が必要なエンドポイントのデコレータ"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'ログインが必要です'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or not user.is_admin:
            return jsonify({'error': '管理者権限が必要です'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login', methods=['POST'])
def login():
    """ログイン"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'メールアドレスとパスワードを入力してください'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'メールアドレスまたはパスワードが正しくありません'}), 401
    
    # セッションにユーザーIDを保存
    session['user_id'] = user.id
    session['is_admin'] = user.is_admin
    session.permanent = True  # クッキーを永続化
    
    return jsonify({
        'message': 'ログインしました',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """ログアウト"""
    session.clear()
    return jsonify({'message': 'ログアウトしました'}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """現在ログイン中のユーザー情報を取得"""
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'ユーザーが見つかりません'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/check', methods=['GET'])
def check_auth():
    """認証状態を確認"""
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'authenticated': True,
                'user': user.to_dict()
            }), 200
    
    return jsonify({'authenticated': False}), 200

