export default function Terminal({ output }) {
  return (
    <div className="p-4 text-sm font-mono bg-black text-green-300 h-full overflow-auto whitespace-pre-wrap">
      {output || ""}
    </div>
  );
}