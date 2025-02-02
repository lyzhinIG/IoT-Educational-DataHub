from functools import wraps

from flask import jsonify

from app.exceptions import IoTException


def iot_exception_handler(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except IoTException as e:
            return jsonify({'error': e.error}), e.status_code

    return decorated_function
