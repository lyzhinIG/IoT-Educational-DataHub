from typing import Optional, Union

import pandas as pd
from pandas import DataFrame

from app.exceptions import *
from app.models import Dataset, db, DeviceData, Device, dataset_management
from sqlalchemy import select, desc, asc

DB_LIMIT = 300

# TODO: from explicit records ids

def dataframe_by_device_id(device_id: int, current_user) -> DataFrame:
    """
    :param current_user:
    :param device_id:
    :return: dataframe:
            | datetime | value |
    """
    device = db.session.execute(select(Device).where(Device.id == device_id)).scalars().first()
    if device is None:
        raise DBIoTNotFoundException(
            Device,
            f"device_id={device_id}"
        )

    # checking granted access to this device to current user
    # one device in one dataset
    user_perm = db.session.execute(select(dataset_management)
                                   .where(dataset_management.c.dataset_id == device.dataset_id,
                                          dataset_management.c.user_id == current_user.id)
                                   ).first()

    if user_perm is None:
        raise DBIoTException(f"Permission denied for device_id={device_id}", 403)

    # get all records from this device
    all_device_records_query = (
        db.session.query(DeviceData)
        .filter(DeviceData.device_id == device_id)
        .order_by(desc(DeviceData.data_sending_date))
        .limit(DB_LIMIT)
    )

    data_list = all_device_records_query.all()
    if not data_list:
        raise DBIoTNotFoundException(
            DeviceData,
            f"device '{device.device_model}' id={device_id}, data list is empty"
        )

    records = [item.to_dict() for item in data_list]
    # print(records)
    df = pd.DataFrame.from_records(records)

    # check dataframe structure
    not_found_cols = []
    for col in ['value', 'device_id', 'data_sending_date']:
        if df.get(col) is not None:
            continue
        not_found_cols.append(col)

    if not_found_cols:
        payload = ", ".join(not_found_cols)
        raise AnalyticsIoTException(f"Not found columns: {payload}", 500)

    # print(f'df: {df}')
    return df


def dataframe_by_list_of_records_id():
    pass


def dataframe_by_few_devices_id(id: list):
    pass
