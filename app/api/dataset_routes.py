import secrets
import string
from datetime import datetime

from flask import jsonify, request
from flask_login import login_required, current_user
from sqlalchemy import select, update

from app.api.utils import collect_device_data
from app.exceptions import WrongDataRequestIoTException
from app.initial import app, mqtt
from app.models import Dataset, db, DeviceData, Device, User, dataset_management, Permissions
from app.utils import iot_exception_handler
import logging


@app.route('/api/user/view_all_available_datasets/', methods=['GET'])
@login_required
def view_all_available_datasets():
    avail_datasets_query = select(dataset_management).where(
        dataset_management.c.user_id == current_user.id
    )
    available_datasets = db.session.execute(avail_datasets_query).all()
    available_datasets_id = [i.dataset_id for i in available_datasets]

    available_datasets_data = db.session.execute(
        select(Dataset).where(Dataset.id.in_(available_datasets_id))
    ).scalars().all()

    # print(f'result: {available_datasets_data}')

    response = {'result': [dataset.to_dict() for dataset in available_datasets_data]}
    return jsonify(response), 200


@app.route('/api/user/view_all_creators_datasets/', methods=['GET'])
@login_required
def view_all_creators_datasets():
    query = select(Dataset).where(Dataset.creator_id == current_user.id)
    user_datasets = db.session.execute(query).scalars().all()

    response = {'result': [dataset.to_dict() for dataset in user_datasets]}
    return jsonify(response)


@app.route('/api/user/view_dataset_data/', methods=['GET'])
@login_required
def view_dataset_data():
    """
    Просмотр данных в указанном датасете

    :return:
    """
    dataset_id = request.args.get('dataset_id')

    req_limit = request.args.get('limit')
    if req_limit is None or int(req_limit) >= 10_000:
        # TODO: in config
        req_limit = 300
    else:
        req_limit = int(req_limit)

    # checking granted access to this dataset to current user
    query = select(dataset_management).where(
        dataset_management.c.dataset_id == dataset_id
    )
    target_dataset_permissions = db.session.execute(query).all()

    current_user_perm = None
    for rec in target_dataset_permissions:
        if current_user.id == rec.user_id:
            current_user_perm = rec.permissions

    if current_user_perm is None:
        return jsonify({"error": "The user does not have permission to view this dataset"}), 405

    all_devices_id_in_dataset = db.session.execute(
        select(Device.id).where(
            Device.dataset_id == dataset_id
        )
    ).scalars().all()

    res = []
    for dev_id in all_devices_id_in_dataset:
        device_data_query = (
            db.session.query(
                Device.id.label('device_id'),
                Device.device_model,
                Device.key,
                Device.parameter_type,
                DeviceData.value,
                DeviceData.data_sending_date
            ).filter(Device.id == dev_id)
            .filter(DeviceData.device_id == Device.id)
            .order_by(DeviceData.data_sending_date.desc())
            .filter(Device.dataset_id == dataset_id)
            .order_by(DeviceData.data_sending_date.asc())
            .limit(req_limit))

        raw_result = [dict(
            device_id=dataset.device_id,
            device_model=dataset.device_model,
            parameter_type=dataset.parameter_type,
            key=dataset.key,
            value=dataset.value,
            data_sending_date=dataset.data_sending_date
        ) for dataset in device_data_query.all()]

        res.extend(raw_result)

    response = {'dataset_id': dataset_id, 'result': res}
    return jsonify(response)


@app.route('/api/user/get_user_info', methods=['GET'])
@login_required
def get_user_info():
    # TODO: for what????
    query = select(User).where(User.id == current_user.id)
    user_data = db.session.execute(query).scalars().all()
    response = {'user_id': current_user.id,
                'result': [user.to_dict() for user in user_data]}

    return jsonify(response)


@app.route('/api/device/collect_device_data', methods=['POST'])
def collect_device_data_post():
    if (not request.json
            or 'device_id' not in request.json
            or 'key' not in request.json
            or 'value' not in request.json):
        return jsonify({'error': 'Incorrect request body'}), 400

    device_id = request.json['device_id']
    key = request.json['key']
    value = request.json['value']

    return collect_device_data(device_id, key, value)


@app.route('/api/device/collect_device_data', methods=['GET'])
def collect_device_data_get():
    if ('device_id' not in request.args
            or 'key' not in request.args
            or 'value' not in request.args):
        return jsonify({'error': 'Incorrect request'}), 400

    device_id = request.args.get('device_id')
    key = request.args.get('key')
    value = request.args.get('value')

    return collect_device_data(device_id, key, value)


@app.route('/api/device/add_new_device', methods=['POST'])
@login_required
def add_new_device():
    if not request.json or 'dataset_id' not in request.json:
        return jsonify({'error': 'No dataset_id in request'}), 400
    if 'parameter_type' not in request.json:
        return jsonify({'error': 'No parameter_type in request'}), 400
    dataset_id = request.json['dataset_id']
    parameter_type = request.json['parameter_type']
    device_model = request.json['device_model']

    # checking if dataset with this id exists
    target_dataset = db.session.execute(
        select(Dataset).where(Dataset.id == dataset_id)
    ).scalars().first()

    if target_dataset is None:
        return jsonify({'error': 'Dataset with specified ID was not found'}), 400

    # generating key for device
    alphabet = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(alphabet) for i in range(10))

    # checking current user's permissions for this dataset
    user_permissions = db.session.execute(
        select(dataset_management)
        .where(
            dataset_management.c.dataset_id == dataset_id,
            dataset_management.c.user_id == current_user.id
        )
    )

    if user_permissions is Permissions.READ.value or user_permissions is None:
        return jsonify({'error': 'User have only READ permissions for this dataset'}), 405

    # adding device to dataset
    date = datetime.utcnow()

    ins_device = Device(
        key=password,
        device_model=device_model,
        dataset_id=dataset_id,
        parameter_type=parameter_type,
        adding_date=date
    )
    db.session.add(ins_device)
    db.session.commit()

    # TODO: try to create MQTT topic
    if mqtt is not None:
        result, mid = mqtt.subscribe(f'iotdatahub/{ins_device.id}')
        logging.info(f"Subscribed to MQTT topic 'iotdatahub/{ins_device.id}' with result code {result}")

    return jsonify({"key": password, "device_id": ins_device.id, "status": "0"}), 200


@app.route('/api/dataset/add_new_dataset', methods=['POST'])
@login_required
def add_new_dataset():
    if not request.json or 'dataset_name' not in request.json:
        return jsonify({'error': 'No dataset_name in request'}), 400

    dataset_name = request.json['dataset_name']

    # adding Dataset record
    date = datetime.utcnow()
    ins_dataset = Dataset(
        dataset_name=dataset_name,
        creator_id=current_user.id,
        adding_date=date
    )

    db.session.add(ins_dataset)
    db.session.commit()

    ins_permission = dataset_management.insert().values(
        dataset_id=ins_dataset.id,
        user_id=current_user.id,
        permissions=Permissions.READ_WRITE_DELETE
    )
    db.session.execute(ins_permission)
    # db.session.add(ins_permission)
    db.session.commit()

    return jsonify({"dataset_id": ins_dataset.id,
                    "status": "0"}), 200


@app.route('/api/user/share_dataset', methods=['POST'])
@login_required
def share_dataset():
    if not request.json or 'target_dataset_id' not in request.json \
            or 'target_user_email' not in request.json \
            or 'target_access_level' not in request.json:
        return jsonify({'error': 'Incorrect request body'}), 400

    # getting data from request
    target_dataset_id = request.json['target_dataset_id']
    target_user_email = request.json['target_user_email']
    target_access_level = request.json['target_access_level']
    if target_access_level != 'READ' and target_access_level != 'READ_WRITE':
        return jsonify({'error': f'Access level must be READ or READ_WRITE. '
                                 f'{target_access_level} was received'}), 400

    # checking if this dataset available for current_user. maybe a little paranoid
    avail_datasets_query = select(dataset_management).where(
        dataset_management.c.user_id == current_user.id
    )
    available_datasets = db.session.execute(avail_datasets_query).all()
    available_datasets_id = [i.dataset_id for i in available_datasets]
    if target_dataset_id not in available_datasets_id:
        return jsonify({'error': 'Target dataset is not available'}), 400

    # getting target user and check it existence
    target_user = db.session.execute(
        select(User).where(User.email == target_user_email)
    ).scalars().first()
    if target_user is None:
        return jsonify({'error': 'User with specified email does not exist'}), 400

    if target_user.id == current_user.id:
        return jsonify({'error': "Can't change creator's permissions"}), 400

    # check if some permission already exists, change it and return
    result = db.session.execute(
        update(dataset_management)
        .where(dataset_management.c.dataset_id == target_dataset_id,
               dataset_management.c.user_id == target_user.id)
        .values(permissions=Permissions[target_access_level])
    )

    if result.rowcount == 0:
        # inserting new permission
        ins_permission = dataset_management.insert().values(
            dataset_id=target_dataset_id,
            user_id=target_user.id,
            permissions=Permissions[target_access_level]
        )
        db.session.execute(ins_permission)

    db.session.commit()

    # TODO return updated or inserted
    return jsonify({"status": "0"}), 200


# TODO: unshare dataset endpoint
@app.route('/api/user/get_device_info', methods=['GET'])
@iot_exception_handler
@login_required
def get_device_info():
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

    if user_permissions is Permissions.READ_WRITE or user_permissions is Permissions.READ_WRITE_DELETE:
        return jsonify({
            'device_id': device.id,
            'device_model': device.device_model,
            'dataset_id': device.dataset_id,
            'key': device.key,
            'status': '0'
        }), 200
    elif user_permissions is Permissions.READ:
        return jsonify({
            'device_id': device.id,
            'device_model': device.device_model,
            'dataset_id': device.dataset_id,
            'status': '0'
        }), 200
    else:
        # if no permissions then go out from my sandbox
        return jsonify({'error': 'User have no permissions for this dataset'}), 403

