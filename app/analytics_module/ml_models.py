import pickle

import pandas as pd
from sklearn.linear_model import ElasticNet
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import TimeSeriesSplit


#---------------        ML      ---------------


def device_data_df_preprocessing(db_df, horizon_value):
    """
    :param db_df:
    :param horizon_value: положительный int от 1 до 30
    :return:
    """
    data = pd.DataFrame([])
    # TODO: check for exceptions
    # TODO: взять частоту и урезать timestamp по ней
    data["timeadd"] = pd.to_datetime(db_df["data_sending_date"])
    data["value"] = db_df["value"]

    # same time data
    data_sensors_min = data.groupby('timeadd')[["value"]].min().add_suffix('_min')
    data_sensors_mean = data.groupby('timeadd')[["value"]].mean().add_suffix('_mean')
    data_sensors_max = data.groupby('timeadd')[["value"]].max().add_suffix('_max')

    df = pd.concat([data_sensors_min, data_sensors_mean, data_sensors_max], axis=1)

    # лаги
    # TODO: сколько у нас значений
    for col in df.columns:
        df[f'{col}_lag1'] = df[col].shift(1)
        df[f'{col}_lag2'] = df[col].shift(2)
        df[f'{col}_lag5'] = df[col].shift(5)
        # df[f'{col}_lag10'] = df[col].shift(10)
        # df[f'{col}_lag15'] = df[col].shift(15)
        # df[f'{col}_lag20'] = df[col].shift(20)
        # df[f'{col}_lag30'] = df[col].shift(30)

    df['timeadd_day'] = df.index.day
    df['timeadd_day_of_week'] = df.index.day_of_week
    df['timeadd_day_of_year'] = df.index.day_of_year
    df['timeadd_hour'] = df.index.hour
    # df['timeadd_minute'] = df.index.minute
    df['timeadd_day_of_week'] = df.index.day_of_week
    # print(df.info())
    # print(df)

    df = df.ffill().bfill()
    X = df.to_numpy()
    y = df['value_mean'].shift(-horizon_value).ffill().bfill()
    return X, y


def elastic_net_regression(X, y):
    # test train
    tscv = TimeSeriesSplit(n_splits=2)
    for i, (train_index, test_index) in enumerate(tscv.split(X)):
        # print(f"Fold {i}:")
        # print(f"  Train: index={train_index}")
        # print(f"  Test:  index={test_index}")
        X_train, X_test = X[train_index], X[test_index]
        y_train, y_test = y[train_index], y[test_index]

    regr = ElasticNet(random_state=0)
    regr.fit(X_train, y_train)
    ElasticNet(random_state=0)

    # print(regr.coef_)
    # print(regr.intercept_)
    res = regr.predict(X[-1].reshape(1, -1))
    mse = mean_squared_error(y_test, regr.predict(X_test))

    print("The mean squared error (MSE) on test set: {:.4f}".format(mse))
    return {'result': res[0], 'mse': mse}


def predict_temperature_humidity_temp_light(data):
    with open('model.pkl', 'rb') as f:
        reg = pickle.load(f)
        reg.predict(data)

