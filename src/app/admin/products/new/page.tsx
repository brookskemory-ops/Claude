import { createProduct } from "../../actions";
import ProductForm from "../ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
        New Product
      </h2>
      <ProductForm action={createProduct} submitLabel="Create Product" />
    </div>
  );
}
