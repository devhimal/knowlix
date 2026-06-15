import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const Newsletter = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1471&q=80"
          alt="Students studying"
          className="w-full h-full object-cover"
        />

        {}
        <div className="absolute inset-0 bg-gradient-to-r from-[#537D96]/90 via-[#537D96]/80 to-[#44A194]/80" />
      </div>

      {}
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Stay Updated with Padyantra
          </h2>

          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Get notified when new study resources, notes, and academic tools are
            added. Join our community of learners and never miss useful content.
          </p>

          {}
          <form className="mt-8 flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="h-12 bg-white text-black border-0 focus-visible:ring-2 focus-visible:ring-[#44A194]"
            />

            <Button
              type="submit"
              className="h-12 px-6 bg-[#44A194] hover:bg-[#3b8f84] text-white font-semibold"
            >
              Subscribe
            </Button>
          </form>

          {}
          <p className="mt-4 text-sm text-white/70">
            No spam. Only valuable updates.
          </p>
        </div>
      </div>
    </section>
  );
};
