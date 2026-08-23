import HomePremium from "./HomePremium";
import HomeServicePriorityBar from "../components/HomeServicePriorityBar";

/**
 * Phase 2 home composition keeps the existing functional home intact while
 * adding the service-first discovery layer above it. This avoids duplicating
 * service logic or changing existing routes.
 */
export default function HomePhase2() {
  return (
    <>
      <HomeServicePriorityBar />
      <HomePremium />
    </>
  );
}
