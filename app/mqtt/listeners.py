# TODO for future using (not only devices)
class MqttEventListeners:
    listeners = list()


def get_all_event_listeners():
    return MqttEventListeners.listeners


def add_event_listener(listener):
    MqttEventListeners.listeners.append(listener)


def remove_event_listener(listener):
    MqttEventListeners.listeners.remove(listener)
