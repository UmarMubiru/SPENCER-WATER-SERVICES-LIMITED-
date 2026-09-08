import os
import requests


class MailgunService:
    def __init__(self):
        self.api_key = os.getenv("MAILGUN_API_KEY")
        self.domain = os.getenv("MAILGUN_DOMAIN")
        self.base_url = os.getenv(
            "MAILGUN_BASE_URL",
            "https://api.mailgun.net/v3"
        )

        if not self.api_key:
            raise ValueError("MAILGUN_API_KEY is not configured")

        if not self.domain:
            raise ValueError("MAILGUN_DOMAIN is not configured")

    def send_email(
        self,
        to,
        subject,
        text,
        html=None,
        attachments=None,
    ):
        url = f"{self.base_url}/{self.domain}/messages"

        data = {
            "from": f"Spencer Water Services <postmaster@{self.domain}>",
            "to": to,
            "subject": subject,
            "text": text,
        }

        if html:
            data["html"] = html

        files = []

        if attachments:
            for attachment in attachments:
                files.append(
                    (
                        "attachment",
                        (
                            attachment.name,
                            attachment.content,
                            "application/pdf",
                        ),
                    )
                )

        response = requests.post(
            url,
            auth=("api", self.api_key),
            data=data,
            files=files,
            timeout=30,
        )

        response.raise_for_status()

        return response.json()
