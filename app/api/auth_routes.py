import base64
import json
from datetime import timedelta

import flask_security
import jwt
from flask import abort
from flask_security.forms import build_form
from flask_security.registerable import register_user
from flask_security.utils import suppress_form_csrf
from werkzeug.datastructures import MultiDict

from app import security

# from app.api.dataset_routes import *
from datetime import datetime
from app.models import Dataset, db, DeviceData, Device, User, dataset_management, Permissions

from app.api.mqtt_routes import *
from app.models import UserApiToken


@security.login_manager.request_loader
def load_user_from_request(request):
    auth_headers = request.headers.get('Authorization', '').split()
    if len(auth_headers) != 2:
        return None
    if auth_headers[0] != 'Bearer':
        return None

    try:
        token = auth_headers[1]
        data = jwt.decode(token, app.config['JWT_PRIVATE_KEY'], algorithms=['HS256'])
        email = data['sub']
        user = User.query.filter_by(
            email=email
        ).first()
        token_db = UserApiToken.query.filter_by(token=token).first()
        if token_db is None:
            return None

        if token_db.expired_at <= datetime.utcnow():
            return None

        if user:
            return user
    except jwt.ExpiredSignatureError:
        return None
    except (jwt.InvalidTokenError, Exception) as e:
        return None
    return None


@security.login_manager.unauthorized_handler
def unauthorized_handler():
    return jsonify({'error': 'Unauthorized: InvalidToken'}), 401


@app.route('/login/', methods=['POST'])
def login():
    auth_header: str = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'No auth header'}), 401

    if not auth_header.startswith("Basic "):
        return jsonify({'error': 'Invalid auth header'}), 401

    auth_creds_b64 = auth_header.split(' ')[1]
    auth_creds = base64.b64decode(auth_creds_b64).decode()
    creds = auth_creds.split(':')
    if len(creds) != 2:
        return jsonify({'error': 'Invalid credentials'}), 401

    email = creds[0]
    password = creds[1]

    user = User.query.filter_by(
        email=email
    ).first()

    if user is None:
        return jsonify({'error': 'Invalid email or password'}), 401

    if not flask_security.verify_password(password, user.password):
        return jsonify({'error': 'Invalid email or password'}), 401

    jwt_payload = {
        'sub': user.email,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(minutes=120)
    }
    my_token = jwt.encode(
        jwt_payload,
        key=app.config['JWT_PRIVATE_KEY']
    )
    my_token_orm = UserApiToken(
        user_id=user.id,
        token=my_token,
        expired_at=jwt_payload['exp'],
        created_at=jwt_payload['iat']
    )
    db.session.add(my_token_orm)
    db.session.commit()

    return jsonify({'token': my_token})


@app.route('/token/info', methods=['GET'])
@login_required
def token_info():
    auth_headers = request.headers.get('Authorization', '').split()
    if len(auth_headers) != 2:
        return None
    if auth_headers[0] != 'Bearer':
        return None

    token = auth_headers[1]
    data = jwt.decode(token, app.config['JWT_PRIVATE_KEY'], algorithms=['HS256'])
    return jsonify({'data': data})




@app.route('/register/', methods=['POST'])
def register():
    form_name = "register_form"

    form_data = MultiDict(request.get_json()) if request.is_json else request.form
    form = build_form(form_name, formdata=form_data, meta=suppress_form_csrf())

    if form.validate_on_submit():
        user = register_user(form)
        username = form_data.get('username', None)
        if not username:
            return jsonify({'error': 'Username is required'}), 400
        user.username = username

        db.session.add(user)
        db.session.commit()
        return jsonify({'success': True,
                        'email': user.email,
                        'username': user.username})
    else:
        return jsonify({'error': form.errors}), 400

# https://www.mulesoft.com/resources/api/restful-api


#______________API_______________

@app.route('/api/get_user_id')
@login_required
def get_user():
    user = db.session.execute(select(User).where(User.id == current_user.id)).scalars().first()
    if not user:
        abort(404)

    # username = db.session.query(User).get(user.id).username
    # print(username)
    return json.dumps({
        'user_id': user.id,
        'username': user.username
    }
    ), 200


@app.route('/api/check_user_creds', methods=['POST'])
def check_user_creds():
    auth_header: str = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'No auth header'}), 401

    if not auth_header.startswith("Basic "):
        return jsonify({'error': 'Invalid auth header'}), 401

    auth_creds_b64 = auth_header.split(' ')[1]
    auth_creds = base64.b64decode(auth_creds_b64).decode()
    creds = auth_creds.split(':')
    if len(creds) != 2:
        return jsonify({'error': 'Invalid credentials'}), 401

    email = creds[0]
    password = creds[1]

    user = User.query.filter_by(
        email=email
    ).first()

    access = -1
    if user is None or not flask_security.verify_password(password, user.password):
        return jsonify({'access': access}), 401

    access = user.access_level
    return jsonify({'access': access}), 200














