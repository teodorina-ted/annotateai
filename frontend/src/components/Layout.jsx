import Nav from "./Nav";
import BottomNav from "./BottomNav";

export default function Layout({ children, hideBottomNav = false }) {
  return (
    <>
      <Nav />
      <main className="fade-in">{children}</main>
      {!hideBottomNav && <BottomNav />}
    </>
  );
}
