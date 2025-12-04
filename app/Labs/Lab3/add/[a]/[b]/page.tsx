export default function AddPage({ params }: { params: { a: string; b: string } }) {
  const a = Number(params.a);
  const b = Number(params.b);
  return (
    <div id="wd-lab3-add">
      <h4>Add</h4>
      {a} + {b} = <b>{isNaN(a + b) ? "NaN" : a + b}</b>
      <hr />
    </div>
  );
}
