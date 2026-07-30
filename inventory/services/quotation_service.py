from inventory.models import SalesQuotation


class QuotationService:
    @staticmethod
    def send(quotation: SalesQuotation):
        quotation.status = SalesQuotation.Status.SENT
        quotation.save(update_fields=["status", "updated_at"])
        return quotation

    @staticmethod
    def accept(quotation: SalesQuotation):
        quotation.status = SalesQuotation.Status.ACCEPTED
        quotation.save(update_fields=["status", "updated_at"])
        return quotation

    @staticmethod
    def reject(quotation: SalesQuotation):
        quotation.status = SalesQuotation.Status.REJECTED
        quotation.save(update_fields=["status", "updated_at"])
        return quotation

    @staticmethod
    def expire(quotation: SalesQuotation):
        quotation.status = SalesQuotation.Status.REJECTED
        quotation.save(update_fields=["status", "updated_at"])
        return quotation