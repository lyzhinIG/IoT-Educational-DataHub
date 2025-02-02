import logging

from flask import jsonify, request
from flask_login import login_required, current_user
from sqlalchemy import select

from app.exceptions import WrongDataRequestIoTException
from app.initial import app, mqtt
from app.models import db, Device, dataset_management


@app.route('/api/device/subscribe_to_device_mqtt_topic/', methods=['GET'])
@login_required
def subscribe_to_device_mqtt_topic():
    if 'device_id' not in request.args:
        raise WrongDataRequestIoTException(
            device_id="not found"
        )
    device_id = request.args.get('device_id')

    device = Device.query.filter_by(
        id=device_id
    ).first()

    if device is None:
        return jsonify({'error': f'Device with specified device_id={device_id} not available'}), 400

    user_permissions = db.session.execute(
        select(dataset_management.c.permissions)
        .where(
            dataset_management.c.dataset_id == device.dataset_id,
            dataset_management.c.user_id == current_user.id
        )
    ).scalars().first()

    if user_permissions is None:
        return jsonify({'error': 'User have no permissions for this device'}), 403
    if mqtt is not None:
        result, mid = mqtt.subscribe(f'iotdatahub/{device_id}')
        logging.info(f"Subscribed to MQTT topic 'iotdatahub/{device_id}' with result code {result}")
        return jsonify({'mqtt_topic': f'iotdatahub/{device_id}', 'status': f'{result}'}), 200
    else:
        return jsonify({'error': 'Not connected to MQTT server', 'status': '1'}), 522



