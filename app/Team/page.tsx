import Link from "next/link";

const teamMembers = [
  {
    name: "Miguel Chica",
    section: "Section 1",
    github: "https://github.com/MigChi",
  },
  {
    name: "Brian Mack",
    section: "Section 1",
    github: "https://github.com/V-O-I-D-E-D",
  },
];

const repositories = [
  {
    label: "Frontend Repository",
    href: "https://github.com/MigChi/kambaz-quizzes-frontend",
    description: "Next.js 15 + Redux toolkit client powering app.",
  },
  {
    label: "Server Repository",
    href: "https://github.com/MigChi/kambaz-quizzes-backend",
    description: "Express + MongoDB API handling users, courses, and quiz attempts.",
  },
];

export default function TeamPage() {
  return (
    <main className="container py-5" id="wd-team">
      <header className="mb-4">
        <p className="text-uppercase text-muted fw-semibold small mb-1">
          Team Directory
        </p>
        <h1 className="h2 fw-bold mb-3">Kambaz Contributors</h1>
        <p className="text-muted">
          Each member is listed with their CS4550 section and GitHub profile.
          Repository links are provided for both the frontend and backend codebases.
        </p>
      </header>

      <section className="mb-5">
        <h2 className="h4 fw-semibold mb-3">Team Members</h2>
        <ul className="list-group">
          {teamMembers.map((member) => (
            <li
              key={member.github}
              className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
            >
              <div>
                <span className="fw-semibold">{member.name}</span>
                <span className="text-muted ms-0 ms-md-2 d-block d-md-inline">
                  {member.section}
                </span>
              </div>
              <Link
                href={member.github}
                className="text-decoration-none"
                target="_blank"
                rel="noreferrer"
              >
                View GitHub Profile
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="h4 fw-semibold mb-3">Repositories</h2>
        <div className="row g-4">
          {repositories.map((repo) => (
            <article className="col-md-6" key={repo.href}>
              <div className="border rounded-3 p-4 h-100">
                <h3 className="h5 fw-semibold">{repo.label}</h3>
                <p className="text-muted small mb-3">{repo.description}</p>
                <Link
                  href={repo.href}
                  className="btn btn-outline-danger btn-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on GitHub
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
