from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models.user import db
from src.models.task import Task
from src.routes.auth import login_required

task_bp = Blueprint('task', __name__)

@task_bp.route('/projects/<int:project_id>/tasks', methods=['GET'])
@login_required
def get_tasks(project_id):
    tasks = Task.query.filter_by(project_id=project_id).all()
    return jsonify([task.to_dict() for task in tasks])

@task_bp.route('/projects/<int:project_id>/tasks', methods=['POST'])
@login_required
def create_task(project_id):
    data = request.json
    task = Task(
        name=data['name'],
        description=data.get('description', ''),
        start_date=datetime.fromisoformat(data['start_date']).date(),
        end_date=datetime.fromisoformat(data['end_date']).date(),
        progress=data.get('progress', 0),
        is_milestone=data.get('is_milestone', False),
        is_completed=data.get('is_completed', False),
        assignee_ids=','.join(str(id) for id in data.get('assignee_ids', [])) if data.get('assignee_ids') else '',
        memo=data.get('memo', ''),
        project_id=project_id
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201

@task_bp.route('/tasks/<int:task_id>', methods=['GET'])
@login_required
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())

@task_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    
    task.name = data.get('name', task.name)
    task.description = data.get('description', task.description)
    
    if 'start_date' in data:
        task.start_date = datetime.fromisoformat(data['start_date']).date()
    if 'end_date' in data:
        task.end_date = datetime.fromisoformat(data['end_date']).date()
    
    task.progress = data.get('progress', task.progress)
    task.is_milestone = data.get('is_milestone', task.is_milestone)
    task.is_completed = data.get('is_completed', task.is_completed)
    
    if 'assignee_ids' in data:
        task.assignee_ids = ','.join(str(id) for id in data['assignee_ids']) if data['assignee_ids'] else ''
    
    task.memo = data.get('memo', task.memo)
    
    db.session.commit()
    return jsonify(task.to_dict())

@task_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return '', 204

