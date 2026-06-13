const OUTCOMES = [
  { value: "4.2h", label: "Average hours saved per day" },
  { value: "+34%", label: "Increase in organic reach" },
  { value: "12m", label: "From trend detection to live post" },
];

export function OutcomeSection() {
  return (
    <section className="border-b border-black bg-white py-20">
      <div className="mx-auto max-w-[1280px] px-4 md:px-12">
        <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
          {OUTCOMES.map(({ value, label }) => (
            <div key={label} className="border border-black py-8">
              <div className="mb-2 text-5xl font-black uppercase tracking-tighter">
                {value}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
