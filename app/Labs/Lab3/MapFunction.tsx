'use client';

export default function MapFunction() {
  const numberArray1 = [1, 2, 3, 4, 5, 6];
  const square = (a: number) => a * a;
  const todos = ["Buy milk", "Feed the pets"];
  const squares = numberArray1.map(square);
  const cubes = numberArray1.map((a) => a * a * a);

  return (
    <div id="wd-map-function">
      <h4>Map Function</h4>
      squares = {squares.join(", ")} <br />
      cubes = {cubes.join(", ")} <br />
      Todos:
      <ol>
        {todos.map((todo, i) => (
          <li key={i}>{todo}</li>
        ))}
      </ol>
      <hr />
    </div>
  );
}
