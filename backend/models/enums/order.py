import enum


class OrderStatus(enum.Enum):
    pending = "pending"
    preparing = "preparing"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentStatus(enum.Enum):
    unpaid = "unpaid"
    paid = "paid"
    refunded = "refunded"
