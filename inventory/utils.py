from decimal import Decimal


def currency(value):

    return Decimal(value).quantize(
        Decimal("0.01")
    )


def percentage(value, total):

    if total == 0:
        return 0

    return round((value / total) * 100, 2)