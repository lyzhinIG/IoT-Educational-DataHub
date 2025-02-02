from datetime import datetime

from flask import jsonify

from app import db
from app.models import Device, DeviceData


def collect_device_data(device_id, key, value):
    # TODO: refactor
    device = Device.query.filter_by(
        id=device_id
    ).first()

    # check if device exists and creds are legal
    if device is None:
        return jsonify({'error': 'Device with specified ID does not exist'}), 400
    if key != device.key:
        return jsonify({'error': 'Invalid device key'}), 400

    # adding DeviceData record
    date = datetime.utcnow()
    ins = DeviceData(
        device_id=device_id,
        value=value,
        data_sending_date=date
    )

    db.session.add(ins)
    db.session.commit()
    return jsonify({"status": "0"}), 200
