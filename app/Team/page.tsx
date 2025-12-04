import Link from "next/link";

export default function team() {
  return (
    <>
      <section id="wd-team-landing" style={{ marginBottom: 24 }}>
        <h2>Team — Landing</h2>
        <p>
          <strong>Brian Mack</strong> — Section <strong>11579</strong>
          <strong>Miguel Chica</strong> — Section <strong>11597</strong>
        </p>

        <h3>Quick links</h3>
        <ul>
          <li>
            <Link href="/" id="wd-kambaz-from-team">Kambaz application</Link>
          </li>
          <li>
            Source code:
            <ul>
              <li>
                <a
                  id="wd-github"
                  href="https://github.com/MigChi/kambaz-quizzes-frontend"
                  target="_blank"
                  rel="noreferrer"
                >
                  Frontend GitHub repository
                </a>
              </li>
              <li>
                <a
                  id="wd-github"
                  href="https://github.com/V-O-I-D-E-D/kambaz-quizzes-backend"
                  target="_blank"
                  rel="noreferrer"
                >
                  Backend GitHub repository
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <div id="wd-kambaz">
        <h1>Kambaz</h1>
          <li>
            <Link href="/" id="wd-kambaz-link">
              Kambaz
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}