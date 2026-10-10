import Inventory from "../../components/car-inventory";
import { getStock } from "../../lib/stock";
import PublicShell from "../../components/public-shell";
import { PageIntro, ContactBand } from "../../components/public-sections";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pre-Owned Car Collection | Manu’s Car World",
  description:
    "Explore pre-owned cars at Manu’s Car World. Filter luxury sedans, family SUVs, and compare full specifications or book a verified test drive.",
};

export default async function CarsPage() {
  const stock = await getStock();
  return (
    <PublicShell>
      <main id="main-content">
        <PageIntro
          label="Our collection"
          title={
            <>
              Find your next
              <br />
              great drive.
            </>
          }
          text="A considered collection. Space to compare. Explore the cars, look into the details and find the one that feels right."
        />
        <Inventory {...stock} />
        <ContactBand />
      </main>
    </PublicShell>
  );
}
