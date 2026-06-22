import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateProduct } from "../../actions";
import ProductForm from "../ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <div>
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
        Edit · {product.name}
      </h2>
      <ProductForm action={action} product={product} submitLabel="Save Changes" />
    </div>
  );
}
