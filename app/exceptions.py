from typing import Dict


class IoTException(Exception):
    error: str
    status_code: int

    def __init__(self, error: str, status_code: int = 400):
        self.error = error
        self.status_code = status_code


class RequestIoTException(IoTException):
    def __init__(self, error: str, status_code: int = 400):
        super().__init__(f"Request error: {error}", status_code)


class WrongDataRequestIoTException(RequestIoTException):
    def __init__(self, **key_to_error: str):
        payload = ", ".join(
            f"'{k}': {v}"
            for k, v in key_to_error.items()
        )
        super().__init__(
            "Wrong data: " + payload,
            status_code=400
        )


class DBIoTException(IoTException):

    def __init__(self, error: str, status_code: int = 400):
        super().__init__(f"Database error: {error}", status_code)


class DBIoTNotFoundException(DBIoTException):
    """Row not found in database"""

    def __init__(
            self,
            entity: any,
            criteria: str,
    ):
        super().__init__(
            error=f"{entity.__name__} not found by criteria: '{criteria}'",
            status_code=404
        )


class AnalyticsIoTException(IoTException):
    """something in analytics module processing"""

    def __init__(self, error: str, status_code: int = 400):
        super().__init__(f"Analytics error: {error}", status_code)



