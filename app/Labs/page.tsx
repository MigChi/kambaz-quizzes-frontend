import Link from "next/link";

export default function Labs() {
  return (
    <>
      <section id="wd-lab1-landing" style={{ marginBottom: 24 }}>
        <h2>Lab 1 — Landing</h2>
        <p>
          <strong>Brian Mack</strong> — Section <strong>11579</strong>
        </p>

        <h3>Quick links</h3>
        <ul>
          <li>
            <Link href="/" id="wd-kambaz-from-lab">Kambaz application</Link>
          </li>
          <li>
            Labs:
            <ul>
              <li><Link href="/Labs/Lab1">Lab 1</Link></li>
              <li><Link href="/Labs/Lab2">Lab 2</Link></li>
              <li><Link href="/Labs/Lab3">Lab 3</Link></li>
              <li><Link href="/Labs/Lab4">Lab 4</Link></li>
              <li><Link href="/Labs/Lab5">Lab 5</Link></li>
            </ul>
          </li>
          <li>
            Source code:
            <ul>
              <li>
                <a
                  id="wd-github"
                  href="https://github.com/V-O-I-D-E-D/kambaz-next-js"
                  target="_blank"
                  rel="noreferrer"
                >
                  Main GitHub repository
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <div id="wd-labs">
        <h1>Labs</h1>
        <ul>
          <li>
            <Link href="/Labs/Lab1" id="wd-lab1-link">
              Lab 1: HTML Examples
            </Link>
          </li>
          <li>
            <Link href="/Labs/Lab2" id="wd-lab2-link">
              Lab 2: CSS Basics
            </Link>
          </li>
          <li>
            <Link href="/Labs/Lab3" id="wd-lab3-link">
              Lab 3: JavaScript Fundamentals
            </Link>
          </li>
          <li>
            <Link href="/Labs/Lab4" id="wd-lab4-link">
              Lab 4: Maintaining State in React Applications
            </Link>
          </li>
          <li>
            <Link href="/Labs/Lab4" id="wd-lab4-link">
              Lab 5: Implementing RESTful Web APIs with Express.js
            </Link>
          </li>
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
