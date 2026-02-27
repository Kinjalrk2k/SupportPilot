import enum


class PaymentStatus(enum.Enum):
    unpaid = "unpaid"
    paid = "paid"
    refunded = "refunded"
