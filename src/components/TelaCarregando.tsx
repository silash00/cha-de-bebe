export default function TelaCarregando() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-50">
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-3 animate-bounce rounded-full bg-stone-400"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-sm text-stone-500">Abrindo seu convite…</p>
    </div>
  );
}
