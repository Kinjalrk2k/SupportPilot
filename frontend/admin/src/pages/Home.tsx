import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageLayout } from "../app/redux/layoutSlice";

function HomePage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setPageLayout({
        breadcrumbs: [{ text: "Home", href: "/" }],
      }),
    );
  }, [dispatch]);

  return <div>Home</div>;
}

export default HomePage;
