import Header from "../../components/header";
import Footer from "../../components/footer";
import Inventory from "../../components/car-inventory";
import { getStock } from "../../lib/stock";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Certified Pre-Owned Cars | Manu’s Car World",
  description:
    "Explore certified pre-owned cars at Manu’s Car World. Filter luxury sedans, family SUVs, and compare full specifications or book a verified test drive.",
};

export default async function CarsPage() {
  const stock = await getStock();
  return (
    <>
      <Header />
      <main id="main-content">
        <div className="catalog-heading">
          <a href="/">Home</a>
          <span>/</span>
          <h1>Our cars</h1>
        </div>
        <Inventory {...stock} />
      </main>
      <Footer />
    </>
  );
}
