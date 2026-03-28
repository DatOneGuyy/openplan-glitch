from server import app
from models import db, Project

def migrate_paths():
    with app.app_context():
        projects = Project.query.all()
        updated_count = 0
        for p in projects:
            if p.designed_image_path and p.designed_image_path.startswith('/projects/'):
                p.designed_image_path = p.designed_image_path.replace('/projects/', '/static/projects/')
                updated_count += 1
        
        db.session.commit()
        print(f"Migration complete. Updated {updated_count} project paths.")

if __name__ == "__main__":
    migrate_paths()
