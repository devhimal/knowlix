import { Star, Quote } from "lucide-react";
import { Card } from "./ui/card";

const testimonials = [
  {
    name: "Sunita Sharma",
    role: "Plus Two Science Student",
    institution: "St. Xavier's College",
    testimonial:
      "Padyantra has been a lifesaver for my physics and chemistry exams. The verified notes are high-quality and easy to understand!",
    avatar: "https://i.pravatar.cc/150?u=sunita",
    rating: 5
  },
  {
    name: "Rajesh Hamal",
    role: "BCA 5th Semester Student",
    institution: "King's College",
    testimonial:
      "I found the exact resources I needed for my database management and OS exams. The premium subscription is totally worth every paisa.",
    avatar: "https://i.pravatar.cc/150?u=rajesh",
    rating: 5
  },
  {
    name: "Anjali Lama",
    role: "Computer Engineering Student",
    institution: "IOE, Pulchowk",
    testimonial:
      "The best place to find previous year questions and solved notes for CTEVT and Engineering courses. A must-have for every Nepali student.",
    avatar: "https://i.pravatar.cc/150?u=anjali",
    rating: 5
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-50/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">
            Testimonials
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Our Students Say
          </h3>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-lg text-gray-600">
            Join thousands of students from across Nepal who are excelling in their studies with Padyantra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <Card
              key={testimonial.name}
              className="p-8 border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white group relative"
            >
              <Quote className="absolute top-6 right-8 h-12 w-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
              
              <div className="flex mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-8 italic relative z-10">
                "{testimonial.testimonial}"
              </p>

              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full border-2 border-white relative z-10"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-gray-900 leading-tight">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-primary font-medium">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-gray-500">
                    {testimonial.institution}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

