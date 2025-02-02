from flask import Flask, render_template, url_for, redirect, request, abort, g
from flask.sessions import SecureCookieSessionInterface
from flask_babel import Babel
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from app.initial import app
from app.models import User, Role, db

from flask_security import SQLAlchemyUserDatastore, Security

from config import Config

migrate = Migrate(app, db)


# Setup Flask-Security
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)

jwt = JWTManager(app)


# Регистрация путей Blueprint
from app.admin.routes import admin_bp

app.register_blueprint(admin_bp, url_prefix="/admin")


def get_locale():
    return 'ru'


babel = Babel(app)
babel.init_app(app, locale_selector=get_locale)

from app.api import auth_routes
from app.api import analytics
from app.api import dataset_routes
