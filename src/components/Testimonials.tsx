import { Star } from "lucide-react";
import { Card } from "./ui/card";

const testimonials = [
  {
    name: "Sunita Sharma",
    role: "Plus Two Student",
    testimonial:
      "This platform has been a lifesaver for my exams. The notes are high-quality and the community is so helpful!",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    name: "Rajesh Hamal",
    role: "Bachelors Student",
    testimonial:
      "I found the exact resources I needed for my semester exams. The premium notes are totally worth it.",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d",
  },
  {
    name: "Anjali Lama",
    role: "CTEVT Student",
    testimonial:
      "The best place to find notes for CTEVT courses. I have also uploaded my notes and earned some money.",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d",
  },
];

export const Testimonials = () => {
  return (
    <div className="py-12 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            What Our Users Say
          </h2>
          <p className="mt-4 text-lg text-foreground">
            Thousands of students and educators trust our platform.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-foreground">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-600 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-foreground">{testimonial.testimonial}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
