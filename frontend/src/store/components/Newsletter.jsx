import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <section className="flex flex-col items-stretch gap-6 rounded-2xl bg-black p-5 text-white sm:p-7 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4 sm:items-center">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary">
          <Mail size={22} />
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-[22px]">Get deals before anyone else</h2>
          <p className="mt-1 max-w-[460px] text-smoke">
            Subscribe for new arrivals, price drops and members-only offers. No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
      {subscribed ? (
        <div
          className="inline-flex items-center gap-2 font-medium text-white [&>svg]:shrink-0 [&>svg]:text-success"
          role="status"
        >
          <CheckCircle2 size={20} /> Thanks! You're subscribed with {email}.
        </div>
      ) : (
        <form className="flex flex-col gap-2 sm:flex-row lg:flex-[0_1_420px]" onSubmit={handleSubmit}>
          <input
            type="email"
            className="input min-w-0 flex-1 border-charcoal"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
            required
          />
          <button type="submit" className="btn btn-primary">
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
};

export default Newsletter;
