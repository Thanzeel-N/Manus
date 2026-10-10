import { notFound } from "next/navigation";
import { getStock } from "../../../lib/stock";
import CarDetail from "../../../components/car-detail";
import PublicShell from "../../../components/public-shell";
import { PageIntro } from "../../../components/public-sections";

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
      <PublicShell><main id="main-content"><PageIntro label="OUR COLLECTION" title="Inventory temporarily unavailable" text="Please try again shortly, or contact our team for help."><a className="p-button" href="/cars">Back to the collection</a></PageIntro></main></PublicShell>
    );
  const car = cars.find((item) => item.id === slug);
  if (!car) notFound();
  return <CarDetail car={car} preview={preview} />;
}
