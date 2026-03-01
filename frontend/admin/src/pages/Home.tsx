import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageLayout } from "../app/layoutSlice";

function HomePage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [{ text: "Home", href: "/" }],
        pageHeader: "Home",
        pageDescription: "Entry point to manage various SupportPilot internals",
      }),
    );
  }, [dispatch]);

  return <div>Home</div>;
}

export default HomePage;
