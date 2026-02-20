"""
Script to seed sample product data for testing.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from database.database import SessionLocal, init_db
from database.models import Product, Seller
from services.embeddings import EmbeddingService
from services.vector_db import VectorDBService


def seed_sample_data():
    """Seed sample products for testing."""
    db = SessionLocal()
    embedding_service = EmbeddingService()
    vector_db = VectorDBService()
    
    try:
        # Create sample seller
        seller = db.query(Seller).filter(Seller.email == "sample@seller.com").first()
        if not seller:
            seller = Seller(
                name="Sample Seller",
                email="sample@seller.com",
                rating=4.5,
                total_sales=1000
            )
            db.add(seller)
            db.commit()
            db.refresh(seller)
        
        # Sample products
        sample_products = [
            {
                "name": "MacBook Pro 16-inch M3 Pro",
                "description": "Powerful laptop for professionals with M3 Pro chip, 16GB RAM, 512GB SSD. Perfect for programming, video editing, and creative work.",
                "category": "Electronics",
                "subcategory": "Laptops",
                "price": 2499.00,
                "attributes": {
                    "brand": "Apple",
                    "processor": "M3 Pro",
                    "ram": "16GB",
                    "storage": "512GB SSD",
                    "screen_size": "16 inch",
                    "color": "Space Gray"
                },
                "tags": ["laptop", "apple", "macbook", "programming", "professional"],
                "stock_quantity": 15,
                "average_rating": 4.8,
                "review_count": 234
            },
            {
                "name": "Dell XPS 15 Laptop",
                "description": "High-performance Windows laptop with Intel i7 processor, 16GB RAM, NVIDIA RTX graphics. Great for gaming and productivity.",
                "category": "Electronics",
                "subcategory": "Laptops",
                "price": 1799.00,
                "attributes": {
                    "brand": "Dell",
                    "processor": "Intel i7",
                    "ram": "16GB",
                    "storage": "512GB SSD",
                    "graphics": "NVIDIA RTX 3050",
                    "screen_size": "15.6 inch"
                },
                "tags": ["laptop", "dell", "windows", "gaming", "productivity"],
                "stock_quantity": 8,
                "average_rating": 4.6,
                "review_count": 189
            },
            {
                "name": "ThinkPad X1 Carbon",
                "description": "Ultra-lightweight business laptop with excellent keyboard, long battery life, and enterprise security features.",
                "category": "Electronics",
                "subcategory": "Laptops",
                "price": 1599.00,
                "attributes": {
                    "brand": "Lenovo",
                    "processor": "Intel i7",
                    "ram": "16GB",
                    "storage": "512GB SSD",
                    "weight": "1.13 kg",
                    "battery": "15 hours"
                },
                "tags": ["laptop", "lenovo", "business", "lightweight", "battery"],
                "stock_quantity": 12,
                "average_rating": 4.7,
                "review_count": 156
            },
            {
                "name": "iPhone 15 Pro Max",
                "description": "Latest iPhone with A17 Pro chip, 256GB storage, titanium design, and advanced camera system.",
                "category": "Electronics",
                "subcategory": "Smartphones",
                "price": 1199.00,
                "attributes": {
                    "brand": "Apple",
                    "storage": "256GB",
                    "color": "Titanium Blue",
                    "screen_size": "6.7 inch",
                    "camera": "48MP"
                },
                "tags": ["phone", "iphone", "apple", "smartphone", "camera"],
                "stock_quantity": 25,
                "average_rating": 4.9,
                "review_count": 567
            },
            {
                "name": "Samsung Galaxy S24 Ultra",
                "description": "Premium Android phone with S Pen, 256GB storage, advanced AI features, and exceptional camera capabilities.",
                "category": "Electronics",
                "subcategory": "Smartphones",
                "price": 1299.00,
                "attributes": {
                    "brand": "Samsung",
                    "storage": "256GB",
                    "color": "Titanium Black",
                    "screen_size": "6.8 inch",
                    "s_pen": True
                },
                "tags": ["phone", "samsung", "android", "s-pen", "camera"],
                "stock_quantity": 18,
                "average_rating": 4.7,
                "review_count": 432
            },
            {
                "name": "Sony WH-1000XM5 Headphones",
                "description": "Premium noise-cancelling wireless headphones with exceptional sound quality and 30-hour battery life.",
                "category": "Electronics",
                "subcategory": "Audio",
                "price": 399.00,
                "attributes": {
                    "brand": "Sony",
                    "type": "Over-ear",
                    "noise_cancelling": True,
                    "battery": "30 hours",
                    "wireless": True
                },
                "tags": ["headphones", "sony", "noise-cancelling", "wireless", "audio"],
                "stock_quantity": 30,
                "average_rating": 4.8,
                "review_count": 892
            },
            {
                "name": "AirPods Pro (2nd Gen)",
                "description": "Apple's premium wireless earbuds with active noise cancellation, spatial audio, and MagSafe charging case.",
                "category": "Electronics",
                "subcategory": "Audio",
                "price": 249.00,
                "attributes": {
                    "brand": "Apple",
                    "type": "In-ear",
                    "noise_cancelling": True,
                    "battery": "6 hours",
                    "wireless": True
                },
                "tags": ["earbuds", "apple", "airpods", "noise-cancelling", "wireless"],
                "stock_quantity": 45,
                "average_rating": 4.7,
                "review_count": 1234
            },
            {
                "name": "Nike Air Max 90",
                "description": "Classic running shoes with Air Max cushioning, comfortable fit, and timeless design.",
                "category": "Fashion",
                "subcategory": "Footwear",
                "price": 120.00,
                "attributes": {
                    "brand": "Nike",
                    "type": "Running Shoes",
                    "size": "Available in multiple sizes",
                    "color": "White/Black",
                    "material": "Mesh and Leather"
                },
                "tags": ["shoes", "nike", "running", "sneakers", "athletic"],
                "stock_quantity": 50,
                "average_rating": 4.5,
                "review_count": 678
            },
            {
                "name": "Levi's 501 Original Jeans",
                "description": "Classic straight-fit jeans, timeless style, durable denim construction.",
                "category": "Fashion",
                "subcategory": "Clothing",
                "price": 89.00,
                "attributes": {
                    "brand": "Levi's",
                    "fit": "Straight",
                    "material": "100% Cotton",
                    "color": "Blue",
                    "sizes": "28-40"
                },
                "tags": ["jeans", "levis", "denim", "casual", "classic"],
                "stock_quantity": 60,
                "average_rating": 4.6,
                "review_count": 456
            },
            {
                "name": "Dyson V15 Detect Vacuum",
                "description": "Cordless vacuum with laser dust detection, powerful suction, and HEPA filtration.",
                "category": "Home & Kitchen",
                "subcategory": "Cleaning",
                "price": 749.00,
                "attributes": {
                    "brand": "Dyson",
                    "type": "Cordless",
                    "power": "230 AW",
                    "battery": "60 minutes",
                    "weight": "2.6 kg"
                },
                "tags": ["vacuum", "dyson", "cordless", "cleaning", "home"],
                "stock_quantity": 20,
                "average_rating": 4.7,
                "review_count": 345
            }
        ]
        
        print(f"Seeding {len(sample_products)} products...")
        
        for product_data in sample_products:
            # Check if product already exists
            existing = db.query(Product).filter(
                Product.name == product_data["name"]
            ).first()
            
            if existing:
                print(f"Skipping {product_data['name']} (already exists)")
                continue
            
            # Create search keywords
            search_keywords = " ".join([
                product_data["name"],
                product_data["description"],
                product_data["category"],
                *product_data.get("tags", [])
            ])
            
            # Create product
            product = Product(
                name=product_data["name"],
                description=product_data["description"],
                category=product_data["category"],
                subcategory=product_data["subcategory"],
                price=product_data["price"],
                attributes=product_data["attributes"],
                tags=product_data["tags"],
                stock_quantity=product_data["stock_quantity"],
                in_stock=product_data["stock_quantity"] > 0,
                seller_id=seller.id,
                seller_name=seller.name,
                average_rating=product_data["average_rating"],
                review_count=product_data["review_count"],
                search_keywords=search_keywords
            )
            
            db.add(product)
            db.flush()  # Get product ID
            
            # Generate embedding
            product_dict = product.to_dict()
            embedding = embedding_service.encode_product(product_dict)
            
            # Store in vector database
            metadata = {
                "product_id": product.id,
                "name": product.name,
                "category": product.category,
                "price": str(product.price)
            }
            vector_db.add_product(product.id, embedding, metadata)
            
            print(f"Added: {product_data['name']}")
        
        db.commit()
        print(f"\nSuccessfully seeded {len(sample_products)} products!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Seeding sample data...")
    seed_sample_data()


