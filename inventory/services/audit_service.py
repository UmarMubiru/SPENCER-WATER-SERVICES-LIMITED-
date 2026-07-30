import logging

logger = logging.getLogger(
    "inventory"
)


class AuditService:

    @staticmethod
    def log(user, action, obj):

        logger.info(

            "%s | %s | %s",

            user,

            action,

            obj,

        )