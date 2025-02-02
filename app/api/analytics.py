import logging
from datetime import datetime

import numpy as np
from flask import request, jsonify
from numpy import square, mean, sqrt
from scipy.interpolate import interpolate
from scipy.stats import pearsonr

from app.analytics_module.calculations_utils import dataframe_by_device_id
from app.analytics_module.ml_models import device_data_df_preprocessing, elastic_net_regression
from app.exceptions import *
from app.initial import app
from flask_login import login_required, current_user
import statistics
from sklearn.metrics import mean_squared_error
import pandas as pd

from app.utils import iot_exception_handler


# TODO: all be list of records id, not by device id.
# or we can choose.


def request_processing_into_df(req, arg='device_id'):
    if arg not in req.args:
        raise WrongDataRequestIoTException(
           **{arg: "not found"}
        )

    device_id_arg = int(req.args.get(arg))
    df = dataframe_by_device_id(device_id_arg, current_user)
    return df


def request_processing_into_values(req, arg='device_id'):
    df = request_processing_into_df(req, arg)
    data = pd.to_numeric(df["value"])
    return data


@app.route('/api/analytics/median/', methods=['GET'])
@login_required
@iot_exception_handler
def median():
    """
    :return:
    """
    data = request_processing_into_values(request)
    return jsonify({'result': statistics.median(data)})


@app.route('/api/analytics/arithmetic_mean/', methods=['GET'])
@login_required
@iot_exception_handler
def arithmetic_mean():
    """
    Среднеарифметическое

    :return:
    """
    data = request_processing_into_values(request)
    return jsonify({'result': statistics.mean(data)})


@app.route('/api/analytics/geometric_mean/', methods=['GET'])
@login_required
@iot_exception_handler
def geometric_mean():
    """
    Среднегеометрическое

    :return:
    """
    data = request_processing_into_values(request)
    return jsonify({'result': statistics.geometric_mean(data)})


@app.route('/api/analytics/root_mean_square/', methods=['GET'])
@login_required
@iot_exception_handler
def root_mean_square():
    """
    Среднеквадратическое

    :return:
    """
    data = request_processing_into_values(request)

    return jsonify({'result': sqrt(mean(square(data)))})


@app.route('/api/analytics/min_value/', methods=['GET'])
@login_required
@iot_exception_handler
def min_value():
    data = request_processing_into_values(request)
    return jsonify({'result': min(data)})


@app.route('/api/analytics/max_value/', methods=['GET'])
@login_required
@iot_exception_handler
def max_value():
    data = request_processing_into_values(request)
    return jsonify({'result': max(data)})


@app.route('/api/analytics/standard_deviation/', methods=['GET'])
@login_required
@iot_exception_handler
def standard_deviation():
    """
    Стандратное отклонение
    """
    data = request_processing_into_values(request)
    return jsonify({'result': statistics.stdev(data)})


@app.route('/api/analytics/correlation_coefficient/', methods=['GET'])
@login_required
@iot_exception_handler
def correlation_coefficient():
    x = request_processing_into_values(request, 'x_device_id')
    y = request_processing_into_values(request, 'y_device_id')

    # length =
    return jsonify({'result': np.round(np.corrcoef(x, y), 8)})


@app.route('/api/analytics/regression_analysis/', methods=['GET'])
@login_required
@iot_exception_handler
def regression_analysis():
    df = request_processing_into_df(request)
    if 'horizon_value' not in request.args:
        raise WrongDataRequestIoTException(
            horison_value="not found"
        )
    horizon_value = int(request.args.get('horizon_value'))
    if horizon_value <= 0 or horizon_value > 30:
        raise WrongDataRequestIoTException(
            horizon_value=f"horizon_value must be between 0 and 30, got {horizon_value}"
        )

    time_begin = datetime.now()
    X, y = device_data_df_preprocessing(df, horizon_value)
    res = elastic_net_regression(X, y)
    time_end = datetime.now()
    time_elapsed = time_end - time_begin
    logging.warning(f"Elapsed time of Elastic net regression: {time_elapsed.microseconds} us or {time_elapsed}s")

    return jsonify(res)


