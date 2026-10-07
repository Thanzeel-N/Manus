import { notFound } from "next/navigation";
import { getStock } from "../../../lib/stock";
import CarDetail from "../../../components/car-detail";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { cars } = await getStock();
  const car = cars.find((item) => item.id === slug);
  return { title: car ? `${car.name} | Manu’s Car World` : "Car details" };
}

export default async function CarPage({ params }) {
  const { slug } = await params;
  const { cars, preview, unavailable } = await getStock();
  if (unavailable)
    return (
      <main className="section">
        <a href="/cars">← Back to cars</a>
        <h1>Inventory temporarily unavailable</h1>
        <p>Please try again shortly.</p>
      </main>
    );
  const car = cars.find((item) => item.id === slug);
  if (!car) notFound();
  return <CarDetail car={car} preview={preview} />;
}
