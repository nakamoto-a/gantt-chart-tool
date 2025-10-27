from datetime import datetime
from src.models.user import db

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    progress = db.Column(db.Integer, default=0)  # 0-100の進捗率
    is_milestone = db.Column(db.Boolean, default=False)
    is_completed = db.Column(db.Boolean, default=False)  # タスク完了状態
    assignee_ids = db.Column(db.Text)  # 担当者のユーザーID（カンマ区切りで複数可）
    memo = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 外部キー
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    
    def __repr__(self):
        return f'<Task {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'progress': self.progress,
            'is_milestone': self.is_milestone,
            'is_completed': self.is_completed,
            'assignee_ids': [int(id) for id in self.assignee_ids.split(',') if id] if self.assignee_ids else [],  # カンマ区切りを配列に変換
            'memo': self.memo,
            'project_id': self.project_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

