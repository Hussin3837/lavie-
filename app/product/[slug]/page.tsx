import ProductDetails from "./ProductDetails";
import { products } from "../../../lib/products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product =
    products.find((p) => p.slug === slug || p.id === slug) ||
    products[0];

  return <ProductDetails product={product} />;
}
