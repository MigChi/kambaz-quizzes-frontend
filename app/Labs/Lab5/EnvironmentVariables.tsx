const NEXT_PUBLIC_HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;

export default function EnvironmentVariables() {
  return (
    <div id="wd-environment-variables">
      <h3>Environment Variables</h3>
      <p>Remote Server: {NEXT_PUBLIC_HTTP_SERVER}</p>
      <hr />
    </div>
  );
}