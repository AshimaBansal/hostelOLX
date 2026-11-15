import ProductCard from './productcard';

function ProductList() {

    const products = [
        {
            id: 1,
            name: "Engineering Book",
            price: 250,
            category: "Books"
        },
        {
            id: 2,
            name: "Scientific Calculator",
            price: 500,
            category: "Electronics"
        },
        {
            id: 3,
            name: "Study Lamp",
            price: 300,
            category: "Hostel Essentials"
        }
    ];

    return (
        <div>
            <h2>Available Products</h2>

            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    name={product.name}
                    price={product.price}
                    category={product.category}
                />
            ))}
        </div>
    );
}

export default ProductList;