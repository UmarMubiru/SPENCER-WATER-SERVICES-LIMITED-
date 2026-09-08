from inventory_lily.models import SalesQuotation, SupplierQuotation


class InvalidQuotationTransition(ValueError):
    """Raised when a quotation action is not valid for its current status."""


def _transition(quotation, target_status, allowed_statuses):
    if quotation.status not in allowed_statuses:
        allowed = ", ".join(allowed_statuses)
        raise InvalidQuotationTransition(
            f"This action is only available when the quotation is {allowed}."
        )
    quotation.status = target_status
    quotation.save(update_fields=["status", "updated_at"])
    return quotation


class QuotationService:
    @staticmethod
    def send(quotation: SalesQuotation):
        return _transition(
            quotation, SalesQuotation.Status.SENT, [SalesQuotation.Status.DRAFT]
        )

    @staticmethod
    def accept(quotation: SalesQuotation):
        return _transition(
            quotation, SalesQuotation.Status.ACCEPTED, [SalesQuotation.Status.SENT]
        )

    @staticmethod
    def reject(quotation: SalesQuotation):
        return _transition(
            quotation, SalesQuotation.Status.REJECTED, [SalesQuotation.Status.SENT]
        )

    @staticmethod
    def expire(quotation: SalesQuotation):
        return _transition(
            quotation, SalesQuotation.Status.EXPIRED, [SalesQuotation.Status.SENT]
        )


class SupplierQuotationService:
    @staticmethod
    def send(quotation: SupplierQuotation):
        return _transition(
            quotation, SupplierQuotation.Status.SENT, [SupplierQuotation.Status.DRAFT]
        )

    @staticmethod
    def accept(quotation: SupplierQuotation):
        return _transition(
            quotation,
            SupplierQuotation.Status.ACCEPTED,
            [SupplierQuotation.Status.SENT, SupplierQuotation.Status.RECEIVED],
        )

    @staticmethod
    def reject(quotation: SupplierQuotation):
        return _transition(
            quotation,
            SupplierQuotation.Status.REJECTED,
            [SupplierQuotation.Status.SENT, SupplierQuotation.Status.RECEIVED],
        )
