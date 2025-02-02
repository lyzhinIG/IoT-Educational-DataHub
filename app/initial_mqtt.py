import dataclasses
import json
from json import JSONDecodeError

from flask import Flask
from flask_cors import CORS
from flask_mqtt import Mqtt

from config import Config
import logging
import config_extended
from pathlib import Path
import os


pidfile = Path("mqtt-monitor.pid")
if pidfile.exists() and (Path("/proc/") / pidfile.read_text()).exists() and pidfile.read_text() != str(os.getpid()):
    print("Already1111!!!", pidfile.read_text(), os.getpid())
    exit(1)

print("well2")

def create_app():
    logging.basicConfig(
        filename='log_file_mqtt.log',
        level=logging.DEBUG,
        format="[{asctime}] [{levelname}] {message}",
        datefmt="%Y-%m-%d %H:%M:%S",
        style="{"
    )

    local_app = Flask(__name__)
    CORS(local_app)

    # Configure the MQTT clientd
    local_app.config['MQTT_BROKER_URL'] = Config.MQTT_BROKER_URL
    local_app.config['MQTT_BROKER_PORT'] = Config.MQTT_BROKER_PORT
    local_app.config['MQTT_USERNAME'] = Config.MQTT_USERNAME
    local_app.config['MQTT_PASSWORD'] = Config.MQTT_PASSWORD
    local_app.config['MQTT_REFRESH_TIME'] = 1.0  # refresh time in seconds

    local_mqtt = Mqtt(mqtt_logging=True)

    local_app.config.from_object(Config)
    local_app.config.from_pyfile('../config_extended.py')

    return local_app, local_mqtt


def create_mqtt(inner_mqtt, inner_app):
    try:
        inner_mqtt.init_app(inner_app)
        logging.info(f'Successfully connected to MQTT broker.\n'
                     f'\tMQTT_BROKER_URL: [{inner_app.config["MQTT_BROKER_URL"]}]\n'
                     f'\tMQTT_BROKER_PORT: [{inner_app.config["MQTT_BROKER_PORT"]}]\n')
        inner_mqtt.publish("test", "heelo!")
    except ConnectionRefusedError as e:
        logging.warning(f'Failed to connect to MQTT broker.\n'
                        f'\tMQTT_BROKER_URL: [{inner_app.config["MQTT_BROKER_URL"]}]\n'
                        f'\tMQTT_BROKER_PORT: [{inner_app.config["MQTT_BROKER_PORT"]}]\n'
                        f'\tError: {e}\n')


app_, mqtt = create_app()


@mqtt.on_connect()
def handle_connect(client, userdata, flags, rc):
    mqtt.subscribe('test')
    mqtt.subscribe('iotdatahub/#')
    mqtt.subscribe('#')
    logging.info(f"Connected to MQTT topic 'test' with result code {rc}")


@dataclasses.dataclass
class MqttMessageDecapsulated:
    topic: str
    payload: str


def __handle_mqtt_message_iotdatahub(
        _client,
        _userdata,
        _message,
        data: MqttMessageDecapsulated
):
    if data.topic.endswith("/status"):
        return

    # split_payload = {i.split(': ')[0]: i.split(': ')[1] for i in data.payload.split(', ')}
    try:
        split_payload = json.loads(data.payload)
    except JSONDecodeError as e:
        mqtt.publish(f'{data.topic}/status', f"JSONDecodeError: {e.msg}".encode())
        return

    device_id = split_payload.get('device_id')
    key = split_payload.get('key')
    value = split_payload.get('value')
    print(device_id, key, value)

    print(device_id and key and value)

    if not device_id or not key or not value:
        mqtt.publish(
            f'{data.topic}/status',
            (
                f"Invalid message, "
                f"device_id={device_id} key={key} value={value}"
            ).encode()
        )
        return

    with app_.app_context():
        from app.api.utils import collect_device_data
        json_res, status = collect_device_data(device_id, key, value)
        logging.info(f'Result of MQTT deivce data collection: {json_res.json}')
        # feedback
        mqtt.publish(f'{data.topic}/status', str(json_res.json).encode())


def __handle_mqtt_message_testing(
        client,
        userdata,
        message,
        data: MqttMessageDecapsulated
):
    pass


TOPIC_PREFIX_HANDLERS = dict(
    iotdatahub=__handle_mqtt_message_iotdatahub,
    testing=__handle_mqtt_message_testing,
)


@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    payload = message.payload.decode()
    data = MqttMessageDecapsulated(
        topic=message.topic,
        payload=payload
    )
    logging.info(f'Received MQTT message: {data}')

    splitted_topic = data.topic.split("/")
    for i in range(len(splitted_topic), 0, -1):
        prefix_topic = "/".join(splitted_topic[:i])
        logging.debug(f"Checking topic '{prefix_topic}'")

        if prefix_topic in TOPIC_PREFIX_HANDLERS:
            logging.debug(f"Topic '{prefix_topic}' found")
            return TOPIC_PREFIX_HANDLERS[prefix_topic](client, userdata, message, data)

    logging.warning(f'Unknown topic: {message.topic}')


create_mqtt(mqtt, app_)
