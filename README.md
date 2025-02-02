# IoT Educational DataHub
Студенческий проект "IoT Educational DataHub". Обработка данных с IoT устройств.
<img alt="Логотип проекта" src="https://github.com/lyzhinIG/IotDataHub/raw/main/other-data/logo.jpeg" height="200">

Проект “IoT Educational DataHub” предлагает решение для обработки и представления данных, полученных от устройств IoT. Платформа обеспечивает сбор данных с различных источников, их объединение и предоставление пользователю анализа и визуального отображения информации с упором на применение в образовательных и любительских целях.

The student project "IoT Educational DataHub". Processing data from IoT devices. 
IoT Educational DataHub offers a solution for processing and presenting data obtained from IoT devices. The platform provides data collection from various sources, their integration, and offers users analysis and visual representation of information with a focus on educational applications.



|    <a href="https://github.com/lyzhinIG/IoT-Educational-DataHub#%D0%B8%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%86%D0%B8%D1%8F-%D0%BF%D0%BE-%D0%B7%D0%B0%D0%BF%D1%83%D1%81%D0%BA%D1%83-%D0%B8-%D0%BD%D0%B0%D1%81%D1%82%D1%80%D0%BE%D0%B9%D0%BA%D0%B5"> Инструкция по запуску и настройке </a>    |
    <a href="https://github.com/lyzhinIG/IoT-Educational-DataHub#screenshot"> Screenshot </a>    |
    <a href="https://github.com/lyzhinIG/IoT-Educational-DataHub#Авторы"> Авторы </a>    |

## Инструкция по запуску и настройке
1. Клонирование репозитория:
`git clone `
2. Создать и активировать venv:
```
python -m venv
source venv/bin/activate # bash/zsh
venv\Scripts\Activate.ps1 # PowerShell
```
3. Установить зависимости:
`pip install -r requirements.txt`

4. Создать файл config.py в корне проекта, установить в нём значение следующих переменных в соответствии с расположением используемой базы данных, брокера MQTT, выбранного способа шифрования паролей и режимом развертывания:
```python
import os
class Config(object):
  DEBUG : bool
  SECRET_KEY = os.environ.get('SECRET_KEY') or '...'
  SQLALCHEMY_DATABASE_URI = '...'
  ################
  # MQTT config
  ################
  MQTT_BROKER_URL = "..."
  MQTT_BROKER_PORT = ...
  MQTT_USERNAME = '...'
  MQTT_PASSWORD = '...'
  ################
  # Flask-Security
  ################
  SECURITY_PASSWORD_HASH = "..."
  SECURITY_PASSWORD_SALT = "..."
  WTF_CSRF_ENABLED = False
  JWT_SECRET_KEY = "..."
  JWT_PRIVATE_KEY = "..."
```
5. Запуск приложения:
`python wsgi.py`
## Screenshot 

*Интерфейс визуализации данных*

<img alt="Интерфейс визуализации данных" src="https://github.com/lyzhinIG/IoT-Educational-DataHub/raw/main/other-data/Screenshot_1.png" width="500">

<img alt="Интерфейс" src="https://github.com/lyzhinIG/IoT-Educational-DataHub/raw/main/other-data/Screenshot_2.png" width="500">

*Вычисление коэффициента корреляции для двух выборок*

<img alt="Вычисление коэффициента корреляции для двух выборок" src="https://github.com/lyzhinIG/IoT-Educational-DataHub/raw/main/other-data/Screenshot_3.png" width="350">

*Добавление устройства*

<img alt="Добавление устройства" src="https://github.com/lyzhinIG/IoT-Educational-DataHub/raw/main/other-data/Screenshot_4.png" width="500">

*Таблица устройств*

<img alt="Таблица устройств" src="https://github.com/lyzhinIG/IoT-Educational-DataHub/raw/main/other-data/Screenshot_5.png" width="500">



## Авторы 
