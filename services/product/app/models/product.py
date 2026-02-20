from sqlalchemy import Column, Integer, String, Float
from ..core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    category = Column(String, index=True)
    price = Column(Float)
    currency = Column(String, default="USD")
    stock_quantity = Column(Integer)
    seller_name = Column(String)
    image_url = Column(String, nullable=True)
