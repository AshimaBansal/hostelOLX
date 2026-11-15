function ProductCard(props) {
    return (
        <div className="product-card">

            <h3>{props.name}</h3>

            <p>Price: ₹{props.price}</p>

            <p>Category: {props.category}</p>

        </div>
    );
}

export default ProductCard;