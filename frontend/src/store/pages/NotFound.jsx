import { Link } from "react-router";

const NotFound = () => (
  <div className="page-container flex flex-col items-center gap-2.5 py-16 text-center [&>h1]:text-[26px] [&>h1]:font-bold [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-2 [&>svg]:text-primary">
    <h1>404</h1>
    <h3>Page not found</h3>
    <p className="text-muted">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn btn-primary">
      Go Home
    </Link>
  </div>
);

export default NotFound;
