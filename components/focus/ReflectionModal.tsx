"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReflectionModalProps {
  isOpen: boolean;
  duration: number;
  onComplete: (reflection: {
    focusQuality: number;
    focusDepth: string;
    whatDistracted: string;
    whatsNext: string;
  }) => void;
}

export default function ReflectionModal({
  isOpen,
  duration,
  onComplete,
}: ReflectionModalProps) {
  const [focusQuality, setFocusQuality] = useState(7);
  const [focusDepth, setFocusDepth] = useState("");
  const [whatDistracted, setWhatDistracted] = useState("");
  const [whatsNext, setWhatsNext] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      focusQuality,
      focusDepth,
      whatDistracted,
      whatsNext,
    });
  };

  const durationMinutes = Math.floor(duration / 60000);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-card rounded-2xl shadow-2xl border-2 border-border w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-border bg-gradient-to-r from-accent/10 to-secondary/10">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="text-accent" size={28} />
                  <h2 className="text-3xl font-bold text-card-foreground">
                    Session Complete!
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  You focused for <span className="font-bold text-accent">{durationMinutes} minutes</span>.
                  Let's reflect on your session.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Focus Quality Rating */}
                <div>
                  <label className="block text-lg font-semibold mb-4 text-card-foreground">
                    How deep was your focus?
                  </label>
                  <div className="flex items-center justify-between mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <motion.button
                        key={rating}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFocusQuality(rating)}
                        className={cn(
                          "w-12 h-12 rounded-full font-bold transition-all flex items-center justify-center",
                          rating <= focusQuality
                            ? "bg-secondary text-secondary-foreground scale-110"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {rating}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Distracted</span>
                    <span>Deep Flow</span>
                  </div>
                </div>

                {/* Focus Depth */}
                <div>
                  <label
                    htmlFor="focusDepth"
                    className="block text-lg font-semibold mb-3 text-card-foreground"
                  >
                    What did you accomplish?
                  </label>
                  <textarea
                    id="focusDepth"
                    value={focusDepth}
                    onChange={(e) => setFocusDepth(e.target.value)}
                    placeholder="Describe what you worked on and what you achieved..."
                    rows={3}
                    className="w-full px-4 py-3 bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Distractions */}
                <div>
                  <label
                    htmlFor="whatDistracted"
                    className="block text-lg font-semibold mb-3 text-card-foreground"
                  >
                    What distracted you?
                  </label>
                  <textarea
                    id="whatDistracted"
                    value={whatDistracted}
                    onChange={(e) => setWhatDistracted(e.target.value)}
                    placeholder="Phone notifications, thoughts, noise, etc..."
                    rows={2}
                    className="w-full px-4 py-3 bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Next Steps */}
                <div>
                  <label
                    htmlFor="whatsNext"
                    className="block text-lg font-semibold mb-3 text-card-foreground"
                  >
                    What's next?
                  </label>
                  <textarea
                    id="whatsNext"
                    value={whatsNext}
                    onChange={(e) => setWhatsNext(e.target.value)}
                    placeholder="What will you work on in your next session..."
                    rows={2}
                    className="w-full px-4 py-3 bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-secondary text-secondary-foreground rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  <span>Complete & Get AI Summary</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
