import random
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from faker import Faker

from config.db import SessionLocal
from models.all import Order, Ticket
from models.enums.order import OrderStatus, PaymentStatus
from models.enums.ticket import TicketStatus, TicketCategory, TicketPriority

fake = Faker("en_IN")

# ------------------------------------------------
# Expanded Indian Food Menu (Regional + Variety)
# ------------------------------------------------

FOOD_ITEMS = [
    # North Indian
    ("Butter Chicken", 280),
    ("Paneer Tikka", 220),
    ("Dal Makhani", 190),
    ("Amritsari Kulcha", 120),
    ("Chole Bhature", 130),

    # South Indian
    ("Masala Dosa", 95),
    ("Idli Sambar", 70),
    ("Medu Vada", 80),
    ("Hyderabadi Chicken Biryani", 260),
    ("Andhra Meals", 180),

    # Street Food
    ("Pav Bhaji", 110),
    ("Vada Pav", 30),
    ("Pani Puri", 40),
    ("Kathi Roll", 120),
    ("Samosa (2 pcs)", 25),

    # Indo-Chinese
    ("Veg Hakka Noodles", 150),
    ("Chicken Fried Rice", 170),
    ("Chilli Paneer", 190),
    ("Manchurian Gravy", 180),

    # Thalis
    ("Veg Thali", 160),
    ("Non-Veg Thali", 240),
    ("Gujarati Thali", 210),
    ("Rajasthani Thali", 230),

    # Desserts
    ("Gulab Jamun (2 pcs)", 60),
    ("Rasgulla (2 pcs)", 55),
    ("Kaju Katli (100g)", 140),
    ("Gajar Halwa", 90),

    # Drinks
    ("Mango Lassi", 70),
    ("Masala Chai", 25),
    ("Cold Coffee", 90),
    ("Sweet Lime Soda", 60),
]

DELIVERY_NOTES = [
    "Please call on arrival",
    "Ring the bell once",
    "Baby sleeping, knock softly",
    "Leave at security",
    "Extra spicy please",
    "Less oil please",
    None,
]

# Weighted Order Status
ORDER_STATUS_WEIGHTS = {
    OrderStatus.delivered: 0.65,
    OrderStatus.out_for_delivery: 0.15,
    OrderStatus.preparing: 0.10,
    OrderStatus.cancelled: 0.05,
    OrderStatus.pending: 0.05,
}

def weighted_choice(weight_dict):
    items = list(weight_dict.keys())
    weights = list(weight_dict.values())
    return random.choices(items, weights=weights, k=1)[0]


def generate_order_items():
    items = []
    total = 0

    for _ in range(random.randint(1, 5)):
        name, price = random.choice(FOOD_ITEMS)
        qty = random.randint(1, 3)
        amount = price * qty
        total += amount

        items.append({
            "name": name,
            "qty": qty,
            "amount": amount
        })

    return items, total


def generate_payment_status(order_status):
    if order_status == OrderStatus.cancelled:
        return PaymentStatus.refunded
    if order_status in [OrderStatus.delivered, OrderStatus.out_for_delivery, OrderStatus.preparing]:
        return random.choice([PaymentStatus.paid, PaymentStatus.paid])
    return PaymentStatus.unpaid


def generate_ticket_for_order(order):
    # Tickets mostly for cancelled or delayed orders
    if order.order_status not in [OrderStatus.cancelled, OrderStatus.delivered]:
        return None

    if random.random() > 0.4:
        return None

    category = random.choice(list(TicketCategory))

    # Smart priority logic
    if category.name in ["billing", "delivery"]:
        priority = TicketPriority.high
    elif category.name in ["login"]:
        priority = TicketPriority.medium
    else:
        priority = TicketPriority.low

    return Ticket(
        id=uuid.uuid4(),
        order_id=order.id,
        category=category,
        priority=priority,
        status=random.choice(list(TicketStatus)),
    )


def seed():
    db: Session = SessionLocal()

    for _ in range(120):  # 120 realistic orders
        items, total = generate_order_items()
        order_status = weighted_choice(ORDER_STATUS_WEIGHTS)
        payment_status = generate_payment_status(order_status)

        # Random date within last 60 days
        created_at = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 60))

        order = Order(
            # id=uuid.uuid4(),
            customer_name=fake.name(),
            customer_phone=fake.phone_number(),
            delivery_address=fake.address().replace("\n", ", "),
            delivery_notes=random.choice(DELIVERY_NOTES),
            items=items,
            total_amount=total,
            order_status=order_status,
            payment_status=payment_status,
            created_at=created_at,
        )

        db.add(order)
        db.flush()  # get order.id

        ticket = generate_ticket_for_order(order)
        if ticket:
            db.add(ticket)

    db.commit()
    db.close()

    print("✅ Seeded highly realistic Indian food delivery dataset!")


if __name__ == "__main__":
    seed()