import enum

from flask_login import UserMixin
from flask_security.models import fsqla_v3 as fsqla
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, BigInteger, Enum, MetaData

from app.initial import app

naming_convention = {
    "ix": 'ix_%(column_0_label)s',
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(column_0_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}
db = SQLAlchemy(app, metadata=MetaData(naming_convention=naming_convention))

# Define models
fsqla.FsModels.set_db_info(db)


class BasicDatahubMixin:
    """
    Базовый mixin для расширения функционала моделей
    """
    def to_dict(self):
        return {field.name: getattr(self, field.name) for field in self.__table__.c}


class AccessLevel(enum.Enum):
    STUDENT = 1
    TEACHER = 2


class Role(db.Model, fsqla.FsRoleMixin, BasicDatahubMixin):
    pass


class User(db.Model, fsqla.FsUserMixin, UserMixin, BasicDatahubMixin):
    access_level = db.Column(
        db.Enum(AccessLevel).values_callable,
        default=str(AccessLevel.STUDENT.value),
        nullable=False
    )


class UserApiToken(db.Model, BasicDatahubMixin):
    """
    Класс для описания JWT токенов
    """
    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'))
    token = db.Column(db.Text)
    expired_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime)


class Dataset(db.Model, BasicDatahubMixin):
    """
    Класс набора данных

    :param id: id набора данных
    :param dataset_name: название набора данных
    :param creator_id: id создателя наборы данных;
        права на изменение и удаление набора есть только у него
    """
    id = db.Column(Integer, primary_key=True)
    dataset_name = db.Column(String(100))
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    adding_date = db.Column(db.DateTime)


class Permissions(enum.Enum):
    READ = 1
    READ_WRITE = 2
    READ_WRITE_DELETE = 3


dataset_management = db.Table(
    'dataset_management',
    db.Column('id', db.Integer, primary_key=True),
    db.Column('dataset_id', db.Integer, db.ForeignKey('dataset.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('permissions', Enum(Permissions), nullable=False)
)


class Device(db.Model, BasicDatahubMixin):
    """
    Модель устройств

    Устройство -- это один датчик или один тип показаний, если датчик комбинированный.

    Например, датчик dht11 представляет из себя два device-a:
    один с parameter_type, соответсвующим температуре, второй - влажности.

    :param parameter_type - тип показаний (напр. температура)
    :param key: ключ, проверяющийся при добавлении данных, генерируется на бэкенде
    """
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), nullable=False)
    device_model = db.Column(db.String(255))
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'), nullable=False)
    parameter_type = db.Column(db.String(255), nullable=False)
    adding_date = db.Column(db.DateTime)


class DeviceData(db.Model, BasicDatahubMixin):
    """
    Данные от устройства
    :param id: id в бд, индексируется автоматически
    :param device_id: id устройства, внешний ключ, индексируется автоматически
    :param value: значение показателя
    """
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('device.id'))
    value = db.Column(db.Text, nullable=False)
    data_sending_date = db.Column(db.DateTime)


class ProcessingType(enum.Enum):
    """
    Тип результата обработки, полученного от модуля аналитики
    """
    ARITHMETICAL_MEAN = 1
    GEOMETRIC_MEAN = 2
    ROOT_MEAN_SQUARE = 3
    MIN = 4
    MAX = 5
    STANDARD_DEVIATION = 6
    CORRELATION = 7
    REGRESSION_ANALYSIS = 8


class ProcessingResult(db.Model, BasicDatahubMixin):
    id = db.Column(db.String(100), primary_key=True)
    dataset_id = db.Column(db.String(100), db.ForeignKey('dataset.id'))
    processing_type = db.Column(Enum(
        ProcessingType
    ))
    processing_result = db.Column(db.Text)
    processing_date = db.Column(db.DateTime)
