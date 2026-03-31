import re


def build_short_description(
    name: str,
    description: str,
    category: str,
    price: float,
    currency: str,
    stock_quantity: int,
    seller_name: str,
) -> str:
    parts = [f"{name} is a {category} product from {seller_name}."]
    if description:
        parts.append(description)
    parts.append(f"Priced at {price:g} {currency}.")
    parts.append(f"Stock: {stock_quantity}.")
    return " ".join(parts)


def build_search_text(
    name: str,
    description: str,
    short_description: str,
    category: str,
    seller_name: str,
    price: float,
    currency: str,
    stock_quantity: int,
) -> str:
    fragments = [
        f"Name: {name}" if name else "",
        f"Category: {category}" if category else "",
        f"Seller: {seller_name}" if seller_name else "",
        f"Description: {description}" if description else "",
        f"Short description: {short_description}" if short_description else "",
        f"Price: {price:g} {currency}".strip() if currency else f"Price: {price:g}",
        f"Stock: {stock_quantity}",
    ]
    combined = "\n".join(fragment for fragment in fragments if fragment)
    return re.sub(r"\s+", " ", combined).strip()
