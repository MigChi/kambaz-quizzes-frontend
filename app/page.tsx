import Link from "next/link";

const landingLinks = [
  {
    href: "/Account/Signin",
    label: "Launch Kambaz",
    description: "Open the Project",
  },
  {
    href: "/Team",
    label: "The Team",
    description: "View team members, sections, and repository links for this project.",
  },
];

export default function LandingPage() {
  return (
    <main className="container py-5" id="wd-landing">
      <section className="mb-5">
        <p className="text-uppercase text-muted fw-semibold mb-2">
          CS4550 · Web Development
        </p>
        <h1 className="display-5 fw-bold mb-3">
          Kambaz Quizzes Project
        </h1>
        <p className="lead text-muted">
        </p>
      </section>

      <section className="row g-4">
        {landingLinks.map((link) => (
          <article className="col-md-6" key={link.href}>
            <div className="border rounded-3 p-4 h-100">
              <h2 className="h5 fw-semibold">{link.label}</h2>
              <p className="text-muted small mb-3">{link.description}</p>
              <Link
                href={link.href}
                className="btn btn-danger"
                role="button"
              >
                {link.label}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
