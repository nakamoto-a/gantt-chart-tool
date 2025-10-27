from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.routes.auth import login_required, admin_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
@login_required
def get_users():
    """ユーザー一覧を取得（担当者選択用）"""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    """ユーザーを作成（管理者のみ）"""
    data = request.json
    
    # 必須フィールドのチェック
    if not data.get('last_name') or not data.get('first_name'):
        return jsonify({'error': '姓と名を入力してください'}), 400
    
    if not data.get('email'):
        return jsonify({'error': 'メールアドレスを入力してください'}), 400
    
    if not data.get('password'):
        return jsonify({'error': 'パスワードを入力してください'}), 400
    
    # メールアドレスの重複チェック
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'このメールアドレスは既に使用されています'}), 400
    
    user = User(
        last_name=data['last_name'],
        first_name=data['first_name'],
        email=data['email'],
        is_admin=data.get('is_admin', False)
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    """ユーザー詳細を取得"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict(include_password=True))

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """ユーザーを更新（管理者のみ）"""
    user = User.query.get_or_404(user_id)
    data = request.json
    
    # メールアドレスの重複チェック
    if 'email' in data and data['email'] != user.email:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'このメールアドレスは既に使用されています'}), 400
    
    user.last_name = data.get('last_name', user.last_name)
    user.first_name = data.get('first_name', user.first_name)
    user.email = data.get('email', user.email)
    user.is_admin = data.get('is_admin', user.is_admin)
    
    # パスワードが指定されている場合のみ更新
    if data.get('password'):
        user.set_password(data['password'])
    
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """ユーザーを削除（管理者のみ）"""
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

