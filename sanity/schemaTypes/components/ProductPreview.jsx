import React from "react";

const ProductPreview = ({ title, image, price, discountedPrice }) => {
  // Sanity Image URL
  const imageUrl = image?.asset?.url;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      )}
      <div>
        <strong>{title}</strong>
        <div>
          {discountedPrice ? (
            <>
              <span style={{ textDecoration: "line-through", color: "#999" }}>
                ${price}
              </span>{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                ${discountedPrice}
              </span>
            </>
          ) : (
            <span>${price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;