from flask import Blueprint, request, jsonify, session
from src.models.user import db
from src.models.project import Project
from src.routes.auth import login_required

project_bp = Blueprint('project', __name__)

@project_bp.route('/projects', methods=['GET'])
@login_required
def get_projects():
    # 共有プロジェクトのみ取得（is_personal=False）
    projects = Project.query.filter_by(is_personal=False).all()
    return jsonify([project.to_dict() for project in projects])

@project_bp.route('/projects/personal', methods=['GET'])
@login_required
def get_personal_projects():
    # 現在のユーザーのマイプロジェクトのみ取得
    user_id = session['user_id']
    projects = Project.query.filter_by(owner_id=user_id, is_personal=True).all()
    return jsonify([project.to_dict() for project in projects])

@project_bp.route('/projects', methods=['POST'])
@login_required
def create_project():
    data = request.json
    user_id = session['user_id']
    
    project = Project(
        name=data['name'],
        description=data.get('description', ''),
        owner_id=user_id if data.get('is_personal') else None,
        is_personal=data.get('is_personal', False)
    )
    db.session.add(project)
    db.session.commit()
    return jsonify(project.to_dict()), 201

@project_bp.route('/projects/<int:project_id>', methods=['GET'])
@login_required
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify(project.to_dict())

@project_bp.route('/projects/<int:project_id>', methods=['PUT'])
@login_required
def update_project(project_id):
    project = Project.query.get_or_404(project_id)
    user_id = session['user_id']
    
    # マイプロジェクトの場合は所有者のみ編集可能
    if project.is_personal and project.owner_id != user_id:
        return jsonify({'error': 'このプロジェクトを編集する権限がありません'}), 403
    
    data = request.json
    project.name = data.get('name', project.name)
    project.description = data.get('description', project.description)
    db.session.commit()
    return jsonify(project.to_dict())

@project_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@login_required
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    user_id = session['user_id']
    
    # マイプロジェクトの場合は所有者のみ削除可能
    if project.is_personal and project.owner_id != user_id:
        return jsonify({'error': 'このプロジェクトを削除する権限がありません'}), 403
    
    db.session.delete(project)
    db.session.commit()
    return '', 204

